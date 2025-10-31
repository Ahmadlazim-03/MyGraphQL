import { Schema, model, models } from "mongoose"

const ActivityLogSchema = new Schema(
  {
    userId: { type: Number, required: false },
    type: { type: String, required: true }, // 'check_run', 'config_saved', 'user_login', etc.
    meta: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true },
)

export const ActivityLog = models.ActivityLog || model("ActivityLog", ActivityLogSchema)
