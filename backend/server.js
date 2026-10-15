import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rateLimit } from "express-rate-limit";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: join(__dirname, ".env"),
});

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many password-reset requests. Please try again later.",
  },
});

for (const key of [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "JWT_SECRET",
]) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const nursePhotoBucket = "nurse-profiles";

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS."));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));

const nursePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.mimetype,
      )
    ) {
      return callback(
        new Error("Only JPG, PNG, and WEBP photos are allowed."),
      );
    }

    callback(null, true);
  },
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "UDM backend is running.",
  });
});

function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  try {
    req.user = jwt.verify(
      authorization.slice("Bearer ".length),
      process.env.JWT_SECRET,
    );

    return next();
  } catch {
    return res.status(401).json({
      message: "Session expired or invalid. Please log in again.",
    });
  }
}

async function requireActiveStaff(req, res, next) {
  try {
    const staffId = req.user?.sub;

    if (!staffId) {
      return res.status(401).json({
        code: "INVALID_SESSION",
        message: "Your session is invalid. Please log in again.",
      });
    }

    const { data: staff, error } = await supabase
      .from("staff_accounts")
      .select(
        "id, staff_id, name, role, status, profile_image, must_change_password",
      )
      .eq("id", staffId)
      .maybeSingle();

    if (error) {
      console.error(
        "Staff status verification failed:",
        error.message,
      );

      return res.status(500).json({
        message: "Unable to verify your account status.",
      });
    }

    const accountStatus = String(staff?.status ?? "")
      .trim()
      .toLowerCase();

    if (!staff || accountStatus !== "active") {
      return res.status(401).json({
        code: "ACCOUNT_DEACTIVATED",
        message:
          "Your account is inactive or no longer exists. Please log in again.",
      });
    }

    req.staff = staff;

    return next();
  } catch (error) {
    console.error(
      "Staff authentication check failed:",
      error.message,
    );

    return res.status(500).json({
      message: "Unable to verify your account.",
    });
  }
}

function requireAdmin(req, res, next) {
  if (req.staff?.must_change_password === true) {
    return res.status(403).json({
      code: "PASSWORD_CHANGE_REQUIRED",
      message:
        "You must change your temporary password before accessing the clinic system.",
    });
  }

  const role = String(req.staff?.role ?? "")
    .trim()
    .toLowerCase();

  if (role !== "administrator") {
    return res.status(403).json({
      code: "ADMIN_REQUIRED",
      message:
        "Administrator access is required. Please log in using your Administrator account.",
    });
  }

  return next();
}

function requireClinicStaff(req, res, next) {
  const staff = req.staff;

  if (staff?.must_change_password === true) {
    return res.status(403).json({
      code: "PASSWORD_CHANGE_REQUIRED",
      message:
        "You must change your temporary password before accessing the clinic system.",
    });
  }

  const role = String(staff?.role ?? "")
    .trim()
    .toLowerCase();

  if (!["nurse", "doctor"].includes(role)) {
    return res.status(403).json({
      message:
        "You are not authorized to access this clinic resource.",
    });
  }

  return next();
}

function mapStaffRecord(
  staff,
  profileImage = staff?.profile_image ?? null,
) {
  if (!staff) {
    return null;
  }

  return {
    id: staff.id,
    staffId: staff.staff_id,
    name: staff.name,
    role: staff.role,
    profileImage,
    status: staff.status,
    mustChangePassword: staff.must_change_password === true,
  };
}

function mapPatientRecord(patient) {
  return {
    id: patient.id,
    studentNumber: patient.student_number,
    patientId: patient.patient_id,
    name: patient.name,
    course: patient.course,
    yearLevel: patient.year_level,
    age: patient.age,
    sex: patient.sex,
    address: patient.address,
  };
}

async function createProfilePhotoUrl(profileImage) {
  if (
    typeof profileImage !== "string" ||
    !profileImage.trim() ||
    profileImage.trim().startsWith("/uploads/nurses/") ||
    /^https?:\/\//i.test(profileImage.trim())
  ) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(nursePhotoBucket)
    .createSignedUrl(profileImage.trim(), 3600);

  if (error) {
    console.error("Photo URL creation failed:", error.message);
    return null;
  }

  return data?.signedUrl || null;
}

function imageContentMatchesMime(buffer, mimeType) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return false;
  }

  if (mimeType === "image/jpeg") {
    return (
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === "image/png") {
    return buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
  }

  if (mimeType === "image/webp") {
    return (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  return false;
}

function handleStaffPhotoUpload(req, res, next) {
  nursePhotoUpload.single("profileImage")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || "Unable to upload the photo.",
      });
    }

    next();
  });
}

function getTemporaryPassword() {
  return `UDM-${randomUUID()}!`;
}

app.post("/api/auth/login", loginLimiter, async (req, res) => {
  try {
    const body = req.body || {};

    const staffId =
      typeof body.staffId === "string"
        ? body.staffId.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!staffId || !password) {
      return res.status(400).json({
        message: "Staff ID and password are required.",
      });
    }

    const { data: staff, error } = await supabase
      .from("staff_accounts")
      .select(
        "id, staff_id, name, role, password, profile_image, status, must_change_password",
      )
      .eq("staff_id", staffId)
      .maybeSingle();

    if (error) {
      console.error("Staff lookup failed:", error.message);

      return res.status(500).json({
        message: "Unable to verify staff account.",
      });
    }

    if (
      !staff ||
      String(staff.status ?? "").trim().toLowerCase() !== "active"
    ) {
      return res.status(401).json({
        code: "ACCOUNT_DEACTIVATED",
        message:
          "Invalid Staff ID or password, or the account is inactive.",
      });
    }

    if (!/^\$2[aby]\$\d{2}\$/.test(staff.password || "")) {
      return res.status(500).json({
        message:
          "Unsupported password format. Contact the system administrator.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      staff.password,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid Staff ID or password.",
      });
    }

    const token = jwt.sign(
      {
        sub: String(staff.id),
        staffId: staff.staff_id,
        role: staff.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    const profileImage = ["nurse", "doctor"].includes(
      String(staff.role || "").trim().toLowerCase(),
    )
      ? await createProfilePhotoUrl(staff.profile_image)
      : null;

    return res.json({
      message: "Login successful.",
      token,
      mustChangePassword: staff.must_change_password === true,
      user: mapStaffRecord(staff, profileImage),
    });
  } catch (error) {
    console.error("Login failed:", error.message);

    return res.status(500).json({
      message: "An unexpected login error occurred.",
    });
  }
});

app.post(
  "/api/auth/forgot-password",
  forgotPasswordLimiter,
  async (req, res) => {
    const body = req.body || {};

    const staffId =
      typeof body.staffId === "string"
        ? body.staffId.trim()
        : "";

    if (!staffId) {
      return res.status(400).json({
        message: "Staff ID is required.",
      });
    }

    try {
      const { data: staff, error: staffError } = await supabase
        .from("staff_accounts")
        .select("staff_id, role, status")
        .eq("staff_id", staffId)
        .maybeSingle();

      if (staffError) {
        console.error(
          "Forgot password lookup failed:",
          staffError.message,
        );

        return res.status(500).json({
          message: "Unable to submit your request right now.",
        });
      }

      const role = String(staff?.role || "")
        .trim()
        .toLowerCase();

      const status = String(staff?.status || "")
        .trim()
        .toLowerCase();

      if (
        staff &&
        ["nurse", "doctor"].includes(role) &&
        status === "active"
      ) {
        const { data: existingRequest, error: existingError } =
          await supabase
            .from("password_reset_requests")
            .select("id")
            .eq("staff_id", staff.staff_id)
            .eq("status", "Pending")
            .limit(1)
            .maybeSingle();

        if (existingError) {
          console.error(
            "Existing password request lookup failed:",
            existingError.message,
          );

          return res.status(500).json({
            message: "Unable to submit your request right now.",
          });
        }

        if (!existingRequest) {
          const { error: insertError } = await supabase
            .from("password_reset_requests")
            .insert({
              staff_id: staff.staff_id,
              status: "Pending",
            });

          if (insertError) {
            console.error(
              "Password reset request failed:",
              insertError.message,
            );

            return res.status(500).json({
              message: "Unable to submit your request right now.",
            });
          }
        }
      }

      return res.json({
        message:
          "If an active Nurse or Doctor account matches that Staff ID, a reset request has been recorded. Please contact your Administrator.",
      });
    } catch (error) {
      console.error(
        "Forgot password request failed:",
        error.message,
      );

      return res.status(500).json({
        message: "Unable to submit your request right now.",
      });
    }
  },
);

app.post(
  "/api/auth/change-password",
  authenticateToken,
  requireActiveStaff,
  async (req, res) => {
    try {
      const body = req.body || {};

      const currentPassword =
        typeof body.currentPassword === "string"
          ? body.currentPassword
          : "";

      const newPassword =
        typeof body.newPassword === "string"
          ? body.newPassword
          : "";

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message:
            "Current password and new password are required.",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          message:
            "Your new password must be at least 8 characters long.",
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          message:
            "Your new password must be different from your current password.",
        });
      }

      const { data: staff, error: lookupError } = await supabase
        .from("staff_accounts")
        .select("id, password, must_change_password")
        .eq("id", req.staff.id)
        .maybeSingle();

      if (lookupError) {
        console.error(
          "Password lookup failed:",
          lookupError.message,
        );

        return res.status(500).json({
          message: "Unable to verify your account.",
        });
      }

      if (!staff) {
        return res.status(404).json({
          message: "Staff account not found.",
        });
      }

      if (!/^\$2[aby]\$\d{2}\$/.test(staff.password || "")) {
        return res.status(500).json({
          message:
            "Unsupported password format. Contact the system administrator.",
        });
      }

      const passwordMatches = await bcrypt.compare(
        currentPassword,
        staff.password,
      );

      if (!passwordMatches) {
        return res.status(401).json({
          message: "Your current password is incorrect.",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const { error: updateError } = await supabase
        .from("staff_accounts")
        .update({
          password: hashedPassword,
          must_change_password: false,
        })
        .eq("id", staff.id);

      if (updateError) {
        console.error(
          "Password update failed:",
          updateError.message,
        );

        return res.status(500).json({
          message: "Unable to change your password.",
        });
      }

      return res.json({
        message: "Password changed successfully.",
      });
    } catch (error) {
      console.error(
        "Password change failed:",
        error.message,
      );

      return res.status(500).json({
        message:
          "An unexpected error occurred while changing your password.",
      });
    }
  },
);

app.get(
  "/api/auth/me",
  authenticateToken,
  requireActiveStaff,
  async (req, res) => {
    try {
      const staff = req.staff;

      const profileImage = ["nurse", "doctor"].includes(
        String(staff.role || "").trim().toLowerCase(),
      )
        ? await createProfilePhotoUrl(staff.profile_image)
        : null;

      return res.json({
        user: mapStaffRecord(staff, profileImage),
      });
    } catch (error) {
      console.error(
        "Session verification failed:",
        error.message,
      );

      return res.status(500).json({
        message: "Unable to verify the staff session.",
      });
    }
  },
);

const patientSelect =
  "id, student_number, patient_id, name, course, year_level, age, sex, address, created_at";

function parsePatientInput(body = {}) {
  const {
    studentNumber,
    patientId,
    name,
    course,
    yearLevel,
    age,
    sex,
    address,
  } = body;

  if (
    typeof studentNumber !== "string" ||
    !studentNumber.trim() ||
    typeof patientId !== "string" ||
    !patientId.trim() ||
    typeof name !== "string" ||
    !name.trim()
  ) {
    return {
      error: "Student Number, Patient ID, and Name are required.",
    };
  }

  const parsedAge =
    age === "" || age == null ? null : Number(age);

  if (
    parsedAge !== null &&
    (!Number.isInteger(parsedAge) ||
      parsedAge < 1 ||
      parsedAge > 120)
  ) {
    return {
      error: "Age must be a whole number between 1 and 120.",
    };
  }

  return {
    values: {
      student_number: studentNumber.trim(),
      patient_id: patientId.trim(),
      name: name.trim(),
      course:
        typeof course === "string"
          ? course.trim() || null
          : null,
      year_level:
        typeof yearLevel === "string"
          ? yearLevel.trim() || null
          : null,
      age: parsedAge,
      sex:
        sex === "Male" || sex === "Female"
          ? sex
          : null,
      address:
        typeof address === "string"
          ? address.trim() || null
          : null,
    },
  };
}

app.get(
  "/api/patients",
  authenticateToken,
  requireActiveStaff,
  requireClinicStaff,
  async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(patientSelect)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Patient lookup failed:", error.message);

        return res.status(500).json({
          message: "Unable to load patient records.",
        });
      }

      return res.json({
        patients: (data || []).map(mapPatientRecord),
      });
    } catch (error) {
      console.error("Patient lookup failed:", error.message);

      return res.status(500).json({
        message: "Unable to load patient records.",
      });
    }
  },
);

app.post(
  "/api/patients",
  authenticateToken,
  requireActiveStaff,
  requireClinicStaff,
  async (req, res) => {
    try {
      const parsed = parsePatientInput(req.body || {});

      if (parsed.error) {
        return res.status(400).json({
          message: parsed.error,
        });
      }

      const { data, error } = await supabase
        .from("patients")
        .insert(parsed.values)
        .select(patientSelect)
        .single();

      if (error) {
        if (error.code === "23505") {
          return res.status(409).json({
            message:
              "Student Number or Patient ID already exists.",
          });
        }

        console.error("Patient creation failed:", error.message);

        return res.status(500).json({
          message: "Unable to add the patient.",
        });
      }

      return res.status(201).json({
        message: "Patient added successfully.",
        patient: mapPatientRecord(data),
      });
    } catch (error) {
      console.error("Patient creation failed:", error.message);

      return res.status(500).json({
        message: "Unable to add the patient.",
      });
    }
  },
);

app.put(
  "/api/patients/:id",
  authenticateToken,
  requireActiveStaff,
  requireClinicStaff,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "Invalid patient record ID.",
        });
      }

      const parsed = parsePatientInput(req.body || {});

      if (parsed.error) {
        return res.status(400).json({
          message: parsed.error,
        });
      }

      const { data, error } = await supabase
        .from("patients")
        .update(parsed.values)
        .eq("id", id)
        .select(patientSelect)
        .maybeSingle();

      if (error) {
        if (error.code === "23505") {
          return res.status(409).json({
            message:
              "Student Number or Patient ID already exists.",
          });
        }

        console.error("Patient update failed:", error.message);

        return res.status(500).json({
          message: "Unable to update the patient.",
        });
      }

      if (!data) {
        return res.status(404).json({
          message: "Patient record not found.",
        });
      }

      return res.json({
        message: "Patient updated successfully.",
        patient: mapPatientRecord(data),
      });
    } catch (error) {
      console.error("Patient update failed:", error.message);

      return res.status(500).json({
        message: "Unable to update the patient.",
      });
    }
  },
);

app.delete(
  "/api/patients/:id",
  authenticateToken,
  requireActiveStaff,
  requireClinicStaff,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "Invalid patient record ID.",
        });
      }

      const { data, error } = await supabase
        .from("patients")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) {
        if (error.code === "23503") {
          return res.status(409).json({
            message:
              "This patient has related clinic records and cannot be deleted. Preserve the patient's medical history.",
          });
        }

        console.error("Patient deletion failed:", error.message);

        return res.status(500).json({
          message: "Unable to delete the patient.",
        });
      }

      if (!data) {
        return res.status(404).json({
          message: "Patient record not found.",
        });
      }

      return res.json({
        message: "Patient deleted successfully.",
        id: data.id,
      });
    } catch (error) {
      console.error("Patient deletion failed:", error.message);

      return res.status(500).json({
        message: "Unable to delete the patient.",
      });
    }
  },
);

app.get(
  "/api/assessments",
  authenticateToken,
  requireActiveStaff,
  requireClinicStaff,
  async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("clinic_assessments")
        .select(`
          id, patient_id, student_number, patient_identifier,
          height, weight, blood_pressure, temperature, heart_rate,
          spo2, bmi, bmi_status, reason, notes, recorded_by, created_at,
          patients (name, student_number, patient_id)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Fetch assessments failed:",
          error.message,
        );

        return res.status(500).json({
          message: "Failed to retrieve clinic assessments.",
        });
      }

      return res.json({
        assessments: data || [],
      });
    } catch (error) {
      console.error(
        "Assessments route failed:",
        error.message,
      );

      return res.status(500).json({
        message: "Failed to retrieve clinic assessments.",
      });
    }
  },
);

app.post(
  "/api/assessments",
  authenticateToken,
  requireActiveStaff,
  requireClinicStaff,
  async (req, res) => {
    try {
      const body = req.body || {};

      const {
        patientId,
        height,
        weight,
        bloodPressure,
        temperature,
        heartRate,
        spo2,
        bmi,
        bmiStatus,
        reason,
        notes,
      } = body;

      const patientRecordId = Number(patientId);

      if (
        !Number.isInteger(patientRecordId) ||
        patientRecordId <= 0
      ) {
        return res.status(400).json({
          message: "A valid patient record is required.",
        });
      }

      const numericFields = {
        height,
        weight,
        temperature,
        heartRate,
        spo2,
        bmi,
      };

      for (const [field, value] of Object.entries(numericFields)) {
        if (
          value === "" ||
          value == null ||
          !Number.isFinite(Number(value))
        ) {
          return res.status(400).json({
            message: `${field} must be a valid number.`,
          });
        }
      }

      const values = {
        height: Number(height),
        weight: Number(weight),
        temperature: Number(temperature),
        heartRate: Number(heartRate),
        spo2: Number(spo2),
        bmi: Number(bmi),
      };

      if (
        values.height <= 0 ||
        values.weight <= 0 ||
        values.temperature <= 0 ||
        values.heartRate <= 0 ||
        values.spo2 < 0 ||
        values.spo2 > 100 ||
        values.bmi <= 0
      ) {
        return res.status(400).json({
          message:
            "One or more assessment measurements are invalid.",
        });
      }

      if (
        typeof bloodPressure !== "string" ||
        !bloodPressure.trim()
      ) {
        return res.status(400).json({
          message: "Blood pressure is required.",
        });
      }

      const { data: patient, error: patientError } =
        await supabase
          .from("patients")
          .select("id, student_number, patient_id")
          .eq("id", patientRecordId)
          .maybeSingle();

      if (patientError) {
        console.error(
          "Assessment patient lookup failed:",
          patientError.message,
        );

        return res.status(500).json({
          message: "Unable to verify the patient.",
        });
      }

      if (!patient) {
        return res.status(404).json({
          message: "Patient record not found.",
        });
      }

      const { data, error } = await supabase
        .from("clinic_assessments")
        .insert({
          patient_id: patient.id,
          student_number: patient.student_number,
          patient_identifier: patient.patient_id,
          height: values.height,
          weight: values.weight,
          blood_pressure: bloodPressure.trim(),
          temperature: values.temperature,
          heart_rate: values.heartRate,
          spo2: values.spo2,
          bmi: values.bmi,
          bmi_status:
            typeof bmiStatus === "string"
              ? bmiStatus.trim()
              : null,
          reason:
            typeof reason === "string"
              ? reason.trim() || null
              : null,
          notes:
            typeof notes === "string"
              ? notes.trim() || null
              : null,
          recorded_by: req.staff.id,
        })
        .select()
        .single();

      if (error) {
        console.error(
          "Assessment creation failed:",
          error.message,
        );

        return res.status(500).json({
          message: "Unable to save the clinic assessment.",
        });
      }

      return res.status(201).json({
        message: "Clinic assessment saved successfully.",
        assessment: data,
      });
    } catch (error) {
      console.error(
        "Assessment creation failed:",
        error.message,
      );

      return res.status(500).json({
        message: "Unable to save the clinic assessment.",
      });
    }
  },
);

app.put(
  "/api/assessments/:id",
  authenticateToken,
  requireActiveStaff,
  requireClinicStaff,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "A valid assessment ID is required.",
        });
      }

      const body = req.body || {};

      const {
        height,
        weight,
        bloodPressure,
        temperature,
        heartRate,
        spo2,
        reason,
        notes,
      } = body;

      for (const [field, value] of Object.entries({
        height,
        weight,
        temperature,
        spo2,
      })) {
        if (
          value == null ||
          value === "" ||
          !Number.isFinite(Number(value)) ||
          Number(value) <= 0
        ) {
          return res.status(400).json({
            message: `Invalid value for ${field}.`,
          });
        }
      }

      if (Number(spo2) > 100) {
        return res.status(400).json({
          message: "SpO2 must not exceed 100.",
        });
      }

      const parsedHeartRate = Number(heartRate);

      if (
        heartRate == null ||
        heartRate === "" ||
        !Number.isInteger(parsedHeartRate) ||
        parsedHeartRate <= 0
      ) {
        return res.status(400).json({
          message:
            "Heart rate must be a positive whole number.",
        });
      }

      if (
        typeof bloodPressure !== "string" ||
        !/^\d{2,3}\/\d{2,3}$/.test(bloodPressure.trim())
      ) {
        return res.status(400).json({
          message: "Enter blood pressure in the format 120/80.",
        });
      }

      if (typeof reason !== "string" || !reason.trim()) {
        return res.status(400).json({
          message: "Reason for visit is required.",
        });
      }

      const heightInMeters = Number(height) / 100;

      const calculatedBmi = Number(
        (
          Number(weight) /
          (heightInMeters * heightInMeters)
        ).toFixed(2),
      );

      const { data, error } = await supabase
        .from("clinic_assessments")
        .update({
          height: Number(height),
          weight: Number(weight),
          blood_pressure: bloodPressure.trim(),
          temperature: Number(temperature),
          heart_rate: parsedHeartRate,
          spo2: Number(spo2),
          bmi: calculatedBmi,
          reason: reason.trim(),
          notes: typeof notes === "string" ? notes.trim() : "",
        })
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) {
        console.error(
          "Assessment update failed:",
          error.message,
        );

        return res.status(500).json({
          message: "Failed to update clinic assessment.",
        });
      }

      if (!data) {
        return res.status(404).json({
          message: "Clinic assessment not found.",
        });
      }

      return res.json({
        message: "Clinic assessment updated successfully.",
        assessment: data,
      });
    } catch (error) {
      console.error(
        "Assessment update failed:",
        error.message,
      );

      return res.status(500).json({
        message: "Failed to update clinic assessment.",
      });
    }
  },
);

app.delete(
  "/api/assessments/:id",
  authenticateToken,
  requireActiveStaff,
  requireClinicStaff,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "A valid assessment ID is required.",
        });
      }

      const { data, error } = await supabase
        .from("clinic_assessments")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) {
        console.error(
          "Assessment deletion failed:",
          error.message,
        );

        return res.status(500).json({
          message: "Failed to delete clinic assessment.",
        });
      }

      if (!data) {
        return res.status(404).json({
          message: "Clinic assessment not found.",
        });
      }

      return res.json({
        message: "Clinic assessment deleted successfully.",
        id: data.id,
      });
    } catch (error) {
      console.error(
        "Assessment deletion failed:",
        error.message,
      );

      return res.status(500).json({
        message: "Failed to delete clinic assessment.",
      });
    }
  },
);

app.get(
  "/api/nurses",
  authenticateToken,
  requireActiveStaff,
  requireClinicStaff,
  async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("staff_accounts")
        .select("id, staff_id, name, role, profile_image, status")
        .eq("role", "Nurse")
        .order("name", { ascending: true });

      if (error) {
        console.error("Nurse lookup failed:", error.message);

        return res.status(500).json({
          message: "Unable to load nurses.",
        });
      }

      const nurses = await Promise.all(
        (data || []).map(async (nurse) => ({
          ...mapStaffRecord(
            nurse,
            await createProfilePhotoUrl(nurse.profile_image),
          ),
          assistingPatient: null,
        })),
      );

      return res.json({ nurses });
    } catch (error) {
      console.error("Nurse lookup failed:", error.message);

      return res.status(500).json({
        message: "Unable to load nurses.",
      });
    }
  },
);

app.put(
  "/api/staff/:id/photo",
  authenticateToken,
  requireActiveStaff,
  requireClinicStaff,
  handleStaffPhotoUpload,
  async (req, res) => {
    let uploadedPhotoPath = null;
    let databaseUpdated = false;

    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "Invalid staff record ID.",
        });
      }

      const requesterRole = String(req.staff?.role || "")
        .trim()
        .toLowerCase();

      if (!["nurse", "doctor"].includes(requesterRole)) {
        return res.status(403).json({
          message:
            "Only Nurses and Doctors can update their own profile photo.",
        });
      }

      const { data: nurse, error: lookupError } = await supabase
        .from("staff_accounts")
        .select("id, staff_id, name, role, profile_image, status")
        .eq("id", id)
        .maybeSingle();

      if (lookupError) {
        console.error(
          "Staff photo lookup failed:",
          lookupError.message,
        );

        return res.status(500).json({
          message: "Unable to verify your staff account.",
        });
      }

      if (
        !nurse ||
        !["nurse", "doctor"].includes(
          String(nurse.role || "").trim().toLowerCase(),
        )
      ) {
        return res.status(404).json({
          message: "Nurse or Doctor account not found.",
        });
      }

      if (String(req.staff.id) !== String(nurse.id)) {
        return res.status(403).json({
          message: "You can update only your own profile photo.",
        });
      }

      const removeProfileImage =
        req.body?.removeProfileImage === "true";

      if (req.file && removeProfileImage) {
        return res.status(400).json({
          message:
            "Upload a photo or remove the current photo, not both.",
        });
      }

      const updates = {};

      if (req.file) {
        const extensions = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        };

        const extension = extensions[req.file.mimetype];

        if (
          !extension ||
          !imageContentMatchesMime(
            req.file.buffer,
            req.file.mimetype,
          )
        ) {
          return res.status(400).json({
            message:
              "The uploaded file is not a valid JPG, PNG, or WEBP image.",
          });
        }

        uploadedPhotoPath =
          `staff/${id}/${randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(nursePhotoBucket)
          .upload(uploadedPhotoPath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (uploadError) {
          console.error(
            "Staff photo upload failed:",
            uploadError.message,
          );

          uploadedPhotoPath = null;

          return res.status(500).json({
            message:
              "Unable to upload the photo. Check that the nurse-profiles storage bucket exists.",
          });
        }

        updates.profile_image = uploadedPhotoPath;
      } else if (removeProfileImage) {
        updates.profile_image = null;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          message: "Choose a new photo or remove the current photo.",
        });
      }

      const { data: updatedNurse, error: updateError } =
        await supabase
          .from("staff_accounts")
          .update(updates)
          .eq("id", id)
          .select(
            "id, staff_id, name, role, profile_image, status, must_change_password",
          )
          .maybeSingle();

      if (updateError) {
        if (uploadedPhotoPath) {
          await supabase.storage
            .from(nursePhotoBucket)
            .remove([uploadedPhotoPath]);

          uploadedPhotoPath = null;
        }

        console.error(
          "Staff photo update failed:",
          updateError.message,
        );

        return res.status(500).json({
          message: "Unable to save your profile photo.",
        });
      }

      if (!updatedNurse) {
        if (uploadedPhotoPath) {
          await supabase.storage
            .from(nursePhotoBucket)
            .remove([uploadedPhotoPath]);

          uploadedPhotoPath = null;
        }

        return res.status(404).json({
          message: "Staff account not found.",
        });
      }

      databaseUpdated = true;

      const oldPhotoPath = nurse.profile_image;

      if (
        oldPhotoPath &&
        oldPhotoPath !== updatedNurse.profile_image &&
        !oldPhotoPath.startsWith("/uploads/nurses/") &&
        !/^https?:\/\//i.test(oldPhotoPath)
      ) {
        const { error: removalError } = await supabase.storage
          .from(nursePhotoBucket)
          .remove([oldPhotoPath]);

        if (removalError) {
          console.error(
            "Old staff photo cleanup failed:",
            removalError.message,
          );
        }
      }

      const photoUrl = await createProfilePhotoUrl(
        updatedNurse.profile_image,
      );

      return res.json({
        message: removeProfileImage
          ? "Profile photo removed successfully."
          : "Profile photo updated successfully.",
        staff: mapStaffRecord(updatedNurse, photoUrl),
      });
    } catch (error) {
      if (uploadedPhotoPath && !databaseUpdated) {
        await supabase.storage
          .from(nursePhotoBucket)
          .remove([uploadedPhotoPath]);
      }

      console.error(
        "Staff photo update failed:",
        error.message,
      );

      return res.status(500).json({
        message: "Unable to update your profile photo.",
      });
    }
  },
);

app.get(
  "/api/nurses/:id/photo-url",
  authenticateToken,
  requireActiveStaff,
  requireClinicStaff,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "Invalid staff record ID.",
        });
      }

      const { data: nurse, error } = await supabase
        .from("staff_accounts")
        .select("id, role, profile_image")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error(
          "Staff photo lookup failed:",
          error.message,
        );

        return res.status(500).json({
          message: "Unable to retrieve the photo.",
        });
      }

      if (
        !nurse ||
        String(nurse.role || "").trim().toLowerCase() !== "nurse"
      ) {
        return res.status(404).json({
          message: "Nurse not found.",
        });
      }

      return res.json({
        signedUrl: await createProfilePhotoUrl(
          nurse.profile_image,
        ),
      });
    } catch (error) {
      console.error(
        "Staff photo retrieval failed:",
        error.message,
      );

      return res.status(500).json({
        message: "Unable to retrieve the photo.",
      });
    }
  },
);

app.get(
  "/api/admin/staff",
  authenticateToken,
  requireActiveStaff,
  requireAdmin,
  async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("staff_accounts")
        .select(
          "id, staff_id, name, role, profile_image, status, must_change_password",
        )
        .order("name", { ascending: true });

      if (error) {
        console.error("Staff listing failed:", error.message);

        return res.status(500).json({
          message: "Unable to load staff accounts.",
        });
      }

      const staff = await Promise.all(
        (data || []).map(async (item) => {
          const photoUrl = ["nurse", "doctor"].includes(
            String(item.role || "").trim().toLowerCase(),
          )
            ? await createProfilePhotoUrl(item.profile_image)
            : null;

          return mapStaffRecord(item, photoUrl);
        }),
      );

      return res.json({ staff });
    } catch (error) {
      console.error("Staff listing failed:", error.message);

      return res.status(500).json({
        message: "Unable to load staff accounts.",
      });
    }
  },
);

app.get(
  "/api/admin/password-reset-requests",
  authenticateToken,
  requireActiveStaff,
  requireAdmin,
  async (_req, res) => {
    try {
      const { data: requests, error: requestError } =
        await supabase
          .from("password_reset_requests")
          .select(
            "id, staff_id, status, requested_at, resolved_at, resolved_by",
          )
          .eq("status", "Pending")
          .order("requested_at", { ascending: false });

      if (requestError) {
        console.error(
          "Password reset requests lookup failed:",
          requestError.message,
        );

        return res.status(500).json({
          message: "Unable to load password reset requests.",
        });
      }

      const staffIds = [
        ...new Set(
          (requests || []).map((request) => request.staff_id),
        ),
      ];

      let staffRecords = [];

      if (staffIds.length > 0) {
        const { data, error: staffError } = await supabase
          .from("staff_accounts")
          .select("staff_id, name, role, status")
          .in("staff_id", staffIds);

        if (staffError) {
          console.error(
            "Staff details lookup failed:",
            staffError.message,
          );

          return res.status(500).json({
            message: "Unable to load staff details.",
          });
        }

        staffRecords = data || [];
      }

      const staffMap = new Map(
        staffRecords.map((staff) => [staff.staff_id, staff]),
      );

      const mappedRequests = (requests || []).map((request) => {
        const staff = staffMap.get(request.staff_id);

        return {
          ...request,
          staffName: staff?.name || "Unknown staff member",
          role: staff?.role || "Unknown",
          accountStatus: staff?.status || "Unknown",
        };
      });

      return res.json({
        requests: mappedRequests,
      });
    } catch (error) {
      console.error(
        "Password reset requests failed:",
        error.message,
      );

      return res.status(500).json({
        message: "Unable to load password reset requests.",
      });
    }
  },
);

app.post(
  "/api/admin/password-reset-requests/:id/reset",
  authenticateToken,
  requireActiveStaff,
  requireAdmin,
  async (req, res) => {
    try {
      const requestId = Number(req.params.id);

      if (!Number.isInteger(requestId) || requestId <= 0) {
        return res.status(400).json({
          message: "Invalid password reset request ID.",
        });
      }

      const { data: request, error: requestError } =
        await supabase
          .from("password_reset_requests")
          .select("id, staff_id, status")
          .eq("id", requestId)
          .maybeSingle();

      if (requestError) {
        console.error(
          "Password reset request lookup failed:",
          requestError.message,
        );

        return res.status(500).json({
          message: "Unable to verify the password reset request.",
        });
      }

      if (!request) {
        return res.status(404).json({
          message: "Password reset request not found.",
        });
      }

      if (
        String(request.status || "").trim().toLowerCase() !==
        "pending"
      ) {
        return res.status(409).json({
          message:
            "This password reset request has already been handled.",
        });
      }

      const { data: target, error: staffError } = await supabase
        .from("staff_accounts")
        .select("id, staff_id, name, role, status")
        .eq("staff_id", request.staff_id)
        .maybeSingle();

      if (staffError) {
        console.error(
          "Staff account lookup failed:",
          staffError.message,
        );

        return res.status(500).json({
          message: "Unable to verify the staff account.",
        });
      }

      if (!target) {
        return res.status(404).json({
          message:
            "The staff account for this request no longer exists.",
        });
      }

      const role = String(target.role || "")
        .trim()
        .toLowerCase();

      const status = String(target.status || "")
        .trim()
        .toLowerCase();

      if (!["nurse", "doctor"].includes(role)) {
        return res.status(403).json({
          message:
            "Only Nurse and Doctor account passwords can be reset here.",
        });
      }

      if (status !== "active") {
        return res.status(400).json({
          message:
            "This staff account is inactive. Activate it before resetting the password.",
        });
      }

      const temporaryPassword = getTemporaryPassword();
      const hashedPassword = await bcrypt.hash(
        temporaryPassword,
        12,
      );

      const { error: passwordError } = await supabase
        .from("staff_accounts")
        .update({
          password: hashedPassword,
          must_change_password: true,
        })
        .eq("id", target.id);

      if (passwordError) {
        console.error(
          "Password reset failed:",
          passwordError.message,
        );

        return res.status(500).json({
          message: "Unable to reset the staff password.",
        });
      }

      const resolvedBy =
        req.staff?.staff_id ||
        req.staff?.staffId ||
        req.staff?.name ||
        "Administrator";

      const {
        data: completedRequest,
        error: updateRequestError,
      } = await supabase
        .from("password_reset_requests")
        .update({
          status: "Completed",
          resolved_at: new Date().toISOString(),
          resolved_by: String(resolvedBy),
        })
        .eq("id", request.id)
        .eq("status", "Pending")
        .select("id")
        .maybeSingle();

      if (updateRequestError || !completedRequest) {
        console.error(
          "Request status update failed:",
          updateRequestError?.message ||
            "The request was already handled.",
        );

        return res.status(500).json({
          message:
            "The password was reset, but the request status could not be confirmed. Give the temporary password to the staff member privately and review this request.",
          temporaryPassword,
          mustChangePassword: true,
        });
      }

      return res.json({
        message:
          `Password reset successfully for ${target.name}. Give the temporary password to the staff member privately; they must change it at the next login.`,
        temporaryPassword,
        mustChangePassword: true,
      });
    } catch (error) {
      console.error(
        "Request password reset failed:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to reset the password for this request.",
      });
    }
  },
);

app.post(
  "/api/admin/staff",
  authenticateToken,
  requireActiveStaff,
  requireAdmin,
  async (req, res) => {
    try {
      const body = req.body || {};

      const staffId =
        typeof body.staffId === "string"
          ? body.staffId.trim()
          : "";

      const name =
        typeof body.name === "string"
          ? body.name.trim()
          : "";

      const password =
        typeof body.password === "string"
          ? body.password
          : "";

      const role =
        typeof body.role === "string"
          ? body.role.trim()
          : "";

      if (!staffId || !name || !password || !role) {
        return res.status(400).json({
          message:
            "Staff ID, name, role, and password are required.",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message:
            "Password must contain at least 8 characters.",
        });
      }

      if (!["Nurse", "Doctor"].includes(role)) {
        return res.status(400).json({
          message: "Invalid staff role.",
        });
      }

      const { data, error } = await supabase
        .from("staff_accounts")
        .insert({
          staff_id: staffId,
          name,
          role,
          password: await bcrypt.hash(password, 12),
          status: "Active",
          must_change_password: true,
        })
        .select(
          "id, staff_id, name, role, profile_image, status, must_change_password",
        )
        .single();

      if (error) {
        if (error.code === "23505") {
          return res.status(409).json({
            message: "That Staff ID already exists.",
          });
        }

        console.error(
          "Staff creation failed:",
          error.message,
        );

        return res.status(500).json({
          message: "Unable to create the staff account.",
        });
      }

      return res.status(201).json({
        message:
          "Staff account created successfully. The staff member must change the initial password at the next login.",
        staff: mapStaffRecord(data),
      });
    } catch (error) {
      console.error("Staff creation failed:", error.message);

      return res.status(500).json({
        message: "Unable to create the staff account.",
      });
    }
  },
);

app.post(
  "/api/admin/staff/:id/reset-password",
  authenticateToken,
  requireActiveStaff,
  requireAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "Invalid staff record ID.",
        });
      }

      const { data: target, error: lookupError } =
        await supabase
          .from("staff_accounts")
          .select("id, staff_id, name, role, status")
          .eq("id", id)
          .maybeSingle();

      if (lookupError) {
        console.error(
          "Password reset lookup failed:",
          lookupError.message,
        );

        return res.status(500).json({
          message: "Unable to verify the staff account.",
        });
      }

      if (!target) {
        return res.status(404).json({
          message: "Staff account not found.",
        });
      }

      const targetRole = String(target.role || "")
        .trim()
        .toLowerCase();

      if (!["nurse", "doctor"].includes(targetRole)) {
        return res.status(403).json({
          code: "ADMIN_ACCOUNT_PROTECTED",
          message:
            "Only Nurse and Doctor account passwords can be reset here.",
        });
      }

      if (
        String(target.status || "").trim().toLowerCase() !==
        "active"
      ) {
        return res.status(400).json({
          message:
            "Activate the staff account before resetting its password.",
        });
      }

      const temporaryPassword = getTemporaryPassword();
      const hashedPassword = await bcrypt.hash(
        temporaryPassword,
        12,
      );

      const { data, error } = await supabase
        .from("staff_accounts")
        .update({
          password: hashedPassword,
          must_change_password: true,
        })
        .eq("id", id)
        .select(
          "id, staff_id, name, role, status, must_change_password",
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Password reset failed:",
          error.message,
        );

        return res.status(500).json({
          message: "Unable to reset the staff password.",
        });
      }

      if (!data) {
        return res.status(404).json({
          message: "Staff account not found.",
        });
      }

      return res.json({
        message:
          `Password reset successfully for ${data.name}. Give the temporary password to the staff member privately; they must change it at the next login.`,
        temporaryPassword,
        mustChangePassword: true,
        staff: mapStaffRecord(data),
      });
    } catch (error) {
      console.error(
        "Password reset failed:",
        error.message,
      );

      return res.status(500).json({
        message: "Unable to reset the staff password.",
      });
    }
  },
);

app.put(
  "/api/admin/staff/:id/details",
  authenticateToken,
  requireActiveStaff,
  requireAdmin,
  (_req, res) => {
    return res.status(403).json({
      code: "STAFF_DETAILS_EDIT_DISABLED",
      message:
        "Administrators cannot edit Nurse or Doctor details.",
    });
  },
);

app.put(
  "/api/admin/staff/:id",
  authenticateToken,
  requireActiveStaff,
  requireAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "Invalid staff record ID.",
        });
      }

      const body = req.body || {};
      const fields = Object.keys(body);

      if (fields.length !== 1 || fields[0] !== "status") {
        return res.status(403).json({
          code: "STATUS_UPDATE_ONLY",
          message:
            "Administrators may only activate or deactivate staff accounts here.",
        });
      }

      if (!["Active", "Inactive"].includes(body.status)) {
        return res.status(400).json({
          message: "Status must be Active or Inactive.",
        });
      }

      const { data: target, error: lookupError } =
        await supabase
          .from("staff_accounts")
          .select("id, role, status")
          .eq("id", id)
          .maybeSingle();

      if (lookupError) {
        console.error(
          "Staff lookup failed:",
          lookupError.message,
        );

        return res.status(500).json({
          message: "Unable to verify the staff account.",
        });
      }

      if (!target) {
        return res.status(404).json({
          message: "Staff account not found.",
        });
      }

      if (
        ["admin", "administrator"].includes(
          String(target.role || "").trim().toLowerCase(),
        )
      ) {
        return res.status(403).json({
          code: "ADMIN_ACCOUNT_PROTECTED",
          message:
            "Administrator accounts cannot be changed here.",
        });
      }

      if (
        Number(req.staff.id) === id &&
        body.status === "Inactive"
      ) {
        return res.status(400).json({
          message: "You cannot deactivate your own account.",
        });
      }

      const { data, error } = await supabase
        .from("staff_accounts")
        .update({
          status: body.status,
        })
        .eq("id", id)
        .select(
          "id, staff_id, name, role, profile_image, status, must_change_password",
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Staff status update failed:",
          error.message,
        );

        return res.status(500).json({
          message:
            "Unable to update the staff account status.",
        });
      }

      if (!data) {
        return res.status(404).json({
          message: "Staff account not found.",
        });
      }

      if (data.status !== body.status) {
        return res.status(500).json({
          message:
            "The database did not save the requested account status.",
        });
      }

      const photoUrl = ["nurse", "doctor"].includes(
        String(data.role || "").trim().toLowerCase(),
      )
        ? await createProfilePhotoUrl(data.profile_image)
        : null;

      return res.json({
        message:
          `Staff account status changed to ${data.status}.`,
        staff: mapStaffRecord(data, photoUrl),
      });
    } catch (error) {
      console.error(
        "Staff status update failed:",
        error.message,
      );

      return res.status(500).json({
        message:
          "Unable to update the staff account status.",
      });
    }
  },
);

app.delete(
  "/api/admin/staff/:id",
  authenticateToken,
  requireActiveStaff,
  requireAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "Invalid staff record ID.",
        });
      }

      if (id === Number(req.staff.id)) {
        return res.status(400).json({
          message: "You cannot delete your own account.",
        });
      }

      const { data: target, error: lookupError } =
        await supabase
          .from("staff_accounts")
          .select("id, role, profile_image")
          .eq("id", id)
          .maybeSingle();

      if (lookupError) {
        console.error(
          "Staff lookup failed:",
          lookupError.message,
        );

        return res.status(500).json({
          message: "Unable to verify the staff account.",
        });
      }

      if (!target) {
        return res.status(404).json({
          message: "Staff account not found.",
        });
      }

      if (
        ["admin", "administrator"].includes(
          String(target.role || "").trim().toLowerCase(),
        )
      ) {
        return res.status(403).json({
          message:
            "Administrator accounts cannot be deleted through this route.",
        });
      }

      const { data, error } = await supabase
        .from("staff_accounts")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) {
        if (error.code === "23503") {
          return res.status(409).json({
            message:
              "This staff account has related records and cannot be deleted.",
          });
        }

        console.error(
          "Staff deletion failed:",
          error.message,
        );

        return res.status(500).json({
          message: "Unable to delete the staff account.",
        });
      }

      if (!data) {
        return res.status(404).json({
          message: "Staff account not found.",
        });
      }

      if (
        target.profile_image &&
        !String(target.profile_image).startsWith(
          "/uploads/nurses/",
        ) &&
        !/^https?:\/\//i.test(String(target.profile_image))
      ) {
        const { error: removalError } = await supabase.storage
          .from(nursePhotoBucket)
          .remove([target.profile_image]);

        if (removalError) {
          console.error(
            "Deleted staff photo cleanup failed:",
            removalError.message,
          );
        }
      }

      return res.json({
        message: "Staff account deleted successfully.",
        id: data.id,
      });
    } catch (error) {
      console.error("Staff deletion failed:", error.message);

      return res.status(500).json({
        message: "Unable to delete the staff account.",
      });
    }
  },
);

app.use("/api", (_req, res) => {
  res.status(404).json({
    message:
      "API route not found. Check the URL and HTTP method.",
  });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled backend error:", error.message);

  if (res.headersSent) {
    return;
  }

  return res.status(500).json({
    message: "An unexpected server error occurred.",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`UDM backend running on port ${PORT}`);
});