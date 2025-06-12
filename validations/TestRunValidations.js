const mongoose = require("mongoose");
const { z } = require("zod");

const objectId = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  });

const testRunSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  module: z.string().optional(),
  projectId: z.string().optional(),
  dueDateFrom: z.coerce.date().optional(),
  dueDateTo: z.coerce.date().optional(),
  testCases: z.array(objectId).optional(),
});

module.exports = { testRunSchema };
