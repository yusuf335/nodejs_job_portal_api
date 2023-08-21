const express = require("express");
const router = express.Router();

// Importing jobs controller methods
const jobsController = require("../controller/jobs");

router.get("/jobs", jobsController.getJobsHandler);

router.get(
  "/jobs/:zipcode/:distance",
  jobsController.searchJobsInRadiusHandler
);

router.get("/jobs-stats/:topic", jobsController.jobStatsHandler);

router.get("/job/:id/:slug", jobsController.getJobByIdandSlugHandler);

router.post("/job/new", jobsController.newJobHandler);

router.put("/job/:id", jobsController.updateJobHandler);

router.delete("/job/:id", jobsController.deleteJobHandler);

module.exports = router;
