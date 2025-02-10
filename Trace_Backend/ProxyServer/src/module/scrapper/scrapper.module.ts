import mongoose from "mongoose";

const DataSchema = new mongoose.Schema(
    {
        keyword: String,
        platform: String,
        results: Object,
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    });
DataSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

const Data = mongoose.model('Data', DataSchema);

export default Data;