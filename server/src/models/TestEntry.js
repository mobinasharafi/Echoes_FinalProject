import mongoose from "mongoose";

const testEntrySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TestEntry = mongoose.model("TestEntry", testEntrySchema);

export default TestEntry;