import { Schema, model, models } from "mongoose"

const RealtimeUpdateSchema = new Schema(
  {
    channel: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

// TTL index - auto delete after 24 hours
RealtimeUpdateSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

export const RealtimeUpdate = models.RealtimeUpdate || model("RealtimeUpdate", RealtimeUpdateSchema)
