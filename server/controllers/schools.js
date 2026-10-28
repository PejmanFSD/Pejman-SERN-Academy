
const Schools = require("../models/schools");

module.exports.createApplication = async (req, res) => {
  const {
    schoolName,
    countryCode,
    city,
    address,
    zipCode,
  } = req.body;

  if (
    typeof schoolName !== "string" ||
    !schoolName.trim() ||
    typeof countryCode !== "string" ||
    !/^[A-Za-z]{2}$/.test(countryCode) ||
    typeof city !== "string" ||
    !city.trim() ||
    typeof address !== "string" ||
    !address.trim()
  ) {
    return res.status(400).json({
      error: "Please provide a valid school name, country, city, and address.",
    });
  }

  if (
    schoolName.trim().length > 200 ||
    city.trim().length > 100 ||
    address.trim().length > 255 ||
    (zipCode != null &&
      (typeof zipCode !== "string" || zipCode.length > 20))
  ) {
    return res.status(400).json({
      error: "One or more fields exceed the allowed length.",
    });
  }

  try {
    const result = await Schools.createApplication({
      schoolName: schoolName.trim(),
      principalId: req.session.user_id,
      countryCode: countryCode.toUpperCase(),
      city: city.trim(),
      address: address.trim(),
      zipCode: zipCode?.trim() || null,
    });

    return res.status(201).json({
      message: "School application submitted for approval.",
      applicationId: result.recordset[0].id,
    });
  } catch (error) {
    if (error.number === 50001) {
      return res.status(409).json({
        error: "An approved school with this name already exists.",
      });
    }

    if (error.number === 547) {
      return res.status(400).json({
        error: "The selected country is invalid.",
      });
    }

    throw error;
  }
};

module.exports.getPendingApplications = async (req, res) => {
  const result = await Schools.getPendingApplications();

  return res.status(200).json({
    applications: result.recordset,
  });
};

// Implemented in the model in the next section
module.exports.approveApplication = async (req, res) => {
  const applicationId = Number(req.params.id);

  if (!Number.isSafeInteger(applicationId) || applicationId < 1) {
    return res.status(400).json({
      error: "Invalid application ID.",
    });
  }

  const result = await Schools.approveApplication(
    applicationId,
    req.session.user_id
  );

  return res.status(200).json({
    message: "School application approved.",
    schoolId: result.schoolId,
  });
};

module.exports.rejectApplication = async (req, res) => {
  const applicationId = Number(req.params.id);

  if (!Number.isSafeInteger(applicationId) || applicationId < 1) {
    return res.status(400).json({
      error: "Invalid application ID.",
    });
  }

  await Schools.rejectApplication(
    applicationId,
    req.session.user_id
  );

  return res.status(200).json({
    message: "School application rejected.",
  });
};

module.exports.getMySchools = async (req, res) => {
  const result = await Schools.getMySchools(
    req.session.user_id
  );

  res.status(200).json({
    schools: result.recordset,
  });
};

module.exports.updateMySchool = async (req, res) => {
  const schoolId = Number(req.params.id);

  if (!Number.isSafeInteger(schoolId) || schoolId < 1) {
    return res.status(400).json({
      error: "Invalid school ID.",
    });
  }

  const {
    schoolName,
    countryCode,
    city,
    address,
    zipCode,
  } = req.body;

  if (
    typeof schoolName !== "string" ||
    !schoolName.trim() ||
    schoolName.trim().length > 200 ||
    typeof countryCode !== "string" ||
    !/^[A-Za-z]{2}$/.test(countryCode) ||
    typeof city !== "string" ||
    !city.trim() ||
    city.trim().length > 100 ||
    typeof address !== "string" ||
    !address.trim() ||
    address.trim().length > 255 ||
    (zipCode != null &&
      (typeof zipCode !== "string" || zipCode.length > 20))
  ) {
    return res.status(400).json({
      error: "Please provide valid school information.",
    });
  }

  try {
    const result = await Schools.updateMySchool(
      schoolId,
      req.session.user_id,
      {
        schoolName: schoolName.trim(),
        countryCode: countryCode.toUpperCase(),
        city: city.trim(),
        address: address.trim(),
        zipCode: zipCode?.trim() || null,
      }
    );

    if (result.recordset[0].affectedRows === 0) {
      return res.status(404).json({
        error: "School not found or you do not own this school.",
      });
    }

    return res.status(200).json({
      message: "School information updated successfully.",
    });
  } catch (error) {
    if (error.number === 2601 || error.number === 2627) {
      return res.status(409).json({
        error: "A school with this name already exists.",
      });
    }

    if (error.number === 547) {
      return res.status(400).json({
        error: "The selected country is invalid.",
      });
    }

    throw error;
  }
};

module.exports.deleteMySchool = async (req, res) => {
  const schoolId = Number(req.params.id);

  if (!Number.isSafeInteger(schoolId) || schoolId < 1) {
    return res.status(400).json({
      error: "Invalid school ID.",
    });
  }

  const result = await Schools.deleteMySchool(
    schoolId,
    req.session.user_id
  );

  if (result.recordset[0].affectedRows === 0) {
    return res.status(404).json({
      error: "School not found or you do not own this school.",
    });
  }

  return res.status(200).json({
    message: "School deleted successfully.",
  });
};

module.exports.rejectApplication = async (req, res) => {
  const applicationId = Number(req.params.id);

  if (!Number.isSafeInteger(applicationId) || applicationId <= 0) {
    return res.status(400).json({
      error: "Invalid application ID.",
    });
  }
  const { rejectionReason } = req.body || {};
  if (typeof rejectionReason !== "string" || !rejectionReason.trim()) {
    return res.status(400).json({
      error: "Please provide a reason for rejecting the school application.",
    });
  }
  console.log("Rejection reason received:", rejectionReason);
  const result = await Schools.rejectApplication(
    applicationId,
    req.session.user_id,
    rejectionReason
  );

  return res.status(200).json(result);
};

module.exports.getMyRejectedApplications = async (req, res) => {
  const result = await Schools.getMyRejectedApplications(
    req.session.user_id
  );

  return res.status(200).json({
    applications: result.recordset,
  });
};
