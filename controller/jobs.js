const Job = require("../models/jobs");

const geoCoder = require("../utils/geocoder");

// Create new job => /api/v1/job/new
exports.newJobHandler = async (req, res, next) => {
  const job = await Job.create(req.body);

  res.status(200).json({
    success: true,
    message: "Job creates",
    data: job,
  });
};

// Get all jobs => /api/v1/jobs
exports.getJobsHandler = async (req, res, next) => {
  const jobs = await Job.find();

  res.status(200).json({
    success: true,
    message: "Job List",
    data: jobs,
  });
};

// Search jobs with radius => /api/v1/jobs/:zipcode/:distance
exports.searchJobsInRadiusHandler = async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get latitude & longitude from geocoder with zipcode
  const location = await geoCoder.geocode(zipcode);
  const latitude = location[0].latitude;
  const longitude = location[0].longitude;

  // Radius of earth in miles 3963
  const radius = distance / 3963;

  const job = await Job.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  res.status(200).json({
    success: true,
    message: "Filtered Job list",
    data: job,
  });
};

// Get a job with id and slug => /api/v1/job/:id/:slug
exports.getJobByIdandSlugHandler = async (req, res, next) => {
  const job = await Job.find({
    $and: [{ _id: req.params.id }, { slug: req.params.slug }],
  });

  if (!job || job.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Job found!",
    data: job,
  });
};

// Update a job => /api/v1/job/:id
exports.updateJobHandler = async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Job Updated",
    data: job,
  });
};

// Delete a job => /api/v1/job/:id
exports.deleteJobHandler = async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  await Job.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Job is Deleted!",
  });
};

// Get job stats by topic => /api/v1/jobs-stats/:topic
exports.jobStatsHandler = async (req, res, next) => {
  try {
    const stats = await Job.aggregate([
      {
        $match: { $text: { $search: req.params.topic } },
      },
      {
        $group: {
          _id: { $toUpper: "$experience" },
          totalJobs: { $sum: 1 },
          avgPosition: { $avg: "$positions" },
          avgSalary: { $avg: "$salary" },
          minSalary: { $min: "$salary" },
          maxSalary: { $max: "$salary" },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        success: false,
        message: `No stats found for - ${req.params.topic}`,
      });
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.log(err);
  }
};
