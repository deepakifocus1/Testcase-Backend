const mongoose = require("mongoose");
const { z } = require("zod");

const objectId = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  });

const uploadTestCasesSchema = z.object({
  module: z.string().min(1, "Module is required"),
  projectId: objectId,
  createdBy: z.string().min(1, "Creator name is required"),
});

module.exports = { uploadTestCasesSchema };
