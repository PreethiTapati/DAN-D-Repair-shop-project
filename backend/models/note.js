import mongoose from 'mongoose';
import autoIncrement from 'mongoose-plugin-autoinc';

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
          
    },
    {
        timestamps: true,
    }
);


noteSchema.plugin(autoIncrement.plugin, {
  model: 'Note',
  field: 'ticket',
  startAt: 500,
  incrementBy: 1,
});



export default  mongoose.model('Note', noteSchema);
