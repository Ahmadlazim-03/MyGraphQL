import { Schema, model, models } from "mongoose"

const AnalyticsSchema = new Schema(
  {
    event: { type: String, required: true },
    userId: { type: Number, required: false },
    provider: { type: String },
    url: { type: String },
    status: { type: String },
    duration: { type: Number },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

// TTL index - auto delete after 90 days
AnalyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })

export const Analytics = models.Analytics || model("Analytics", AnalyticsSchema)
