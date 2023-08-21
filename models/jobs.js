const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const slugify = require("slugify");
const geoCoder = require("../utils/geocoder");

const jobSchema = new Schema({
  title: {
    type: String,
    required: [true, "Please enter job title"],
    trim: true,
    maxLength: [100, "Job title is too long! Can not exceed 100 characters."],
  },
  slug: {
    type: String,
  },
  description: {
    type: String,
    required: [true, "Please enter job description."],
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Please add a valid email."],
  },
  address: {
    type: String,
    required: [true, "Please enter an address."],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  company: {
    type: String,
    required: [true, "Please enter a company name."],
  },
  industry: {
    type: [String],
    required: true,
    enum: {
      values: [
        "Business",
        "Information Technology",
        "Banking",
        "Education/Training",
        "Telecommunication",
        "Others",
      ],
      message: "Please select correct options for inductry.",
    },
  },
  jobType: {
    type: String,
    required: true,
    enum: {
      values: ["Permanent", "Temporary", "Internship"],
      message: "Please select correct options for job type",
    },
  },
  minEducation: {
    type: String,
    required: true,
    enum: {
      values: ["Bachelors", "Masters", "Phd"],
      message: "Please select correct options for Education.",
    },
  },
  positions: {
    type: Number,
    default: 1,
  },
  experience: {
    type: String,
    required: [true, "Please enter experience required for this job."],
    enum: {
      values: [
        "No Experience",
        "1 Year - 2 Years",
        "2 Year - 5 Years",
        "5 Years+",
      ],
      message: "Please select correct options for Experience.",
    },
  },
  salary: {
    type: Number,
    required: [true, "Please enter expected salary for this job."],
  },
  postingDate: {
    type: Date,
    default: Date.now,
  },
  lastDate: {
    type: Date,
    default: new Date().setDate(new Date().getDate() + 7),
  },
  applicantsApplied: {
    type: [Object],
    select: false,
  },
});

//  Creating Job Slg before saving
jobSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Setting up locationn
jobSchema.pre("save", async function (next) {
  const location = await geoCoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [location[0].longitude, location[0].latitude],
    formattedAddress: location[0].formattedAddress,
    city: location[0].city,
    state: location[0].state,
    zipcode: location[0].zipcode,
    country: location[0].country,
  };
});

module.exports = mongoose.model("Job", jobSchema);
