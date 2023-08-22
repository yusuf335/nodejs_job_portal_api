const Job = require("../models/jobs");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const geoCoder = require("../utils/geocoder");
const APIFilters = require("../utils/apiFilters");

// Create new job => /api/v1/job/new
exports.newJobHandler = catchAsyncErrors(async (req, res, next) => {
  const job = await Job.create(req.body);

  res.status(200).json({
    success: true,
    message: "Job creates",
    data: job,
  });
});

// Get all jobs => /api/v1/jobs
exports.getJobsHandler = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new APIFilters(Job.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .searchByQuery()
    .pagination();
  const jobs = await apiFilters.query;

  res.status(200).json({
    success: true,
    message: "Job List",
    data: jobs,
  });
});

// Search jobs with radius => /api/v1/jobs/:zipcode/:distance
exports.searchJobsInRadiusHandler = catchAsyncErrors(async (req, res, next) => {
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
});

// Get a job with id and slug => /api/v1/job/:id/:slug
exports.getJobByIdandSlugHandler = catchAsyncErrors(async (req, res, next) => {
  const job = await Job.find({
    $and: [{ _id: req.params.id }, { slug: req.params.slug }],
  });

  if (!job || job.length === 0) {
    return next(new ErrorHandler("Job not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Job found!",
    data: job,
  });
});

// Update a job => /api/v1/job/:id
exports.updateJobHandler = catchAsyncErrors(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
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
});

// Delete a job => /api/v1/job/:id
exports.deleteJobHandler = catchAsyncErrors(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  await Job.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Job is Deleted!",
  });
});

// Get job stats by topic => /api/v1/jobs-stats/:topic
exports.jobStatsHandler = catchAsyncErrors(async (req, res, next) => {
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
      return next(
        new ErrorHandler(`No stats found for - ${req.params.topic}`, 200)
      );
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.log(err);
  }
});
