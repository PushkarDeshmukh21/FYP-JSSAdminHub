const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
    professorName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    class: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }]
    },
    department: {
        type: String,
        required: true,
        enum: ['CSE', 'ECE', 'Civil', 'Mech', 'EEE', 'IP', 'Env', 'BT']
    },
    patents: [
        {
            type: {
                type: String,
                required: true,
                enum: ['Utility', 'Design', 'Plant']
            },
            agency: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            year: {
                type: Number,
                required: true,
                validate: {
                    validator: function (v) {
                        return v > 1900 && v <= new Date().getFullYear();
                    },
                    message: 'Year must be between 1900 and the current year'
                }
            },
            file: {
                data: {
                    type: Buffer,
                    required: true
                },
                contentType: {
                    type: String,
                    required: true
                }
            }
        }
    ],
    fdpWorkshops: [
        {
            conductedBy: {
                type: String,
                required: true
            },
            eventType: {
                type: String,
                required: true
            },
            institution: {
                type: String,
                required: true
            },
            startDate: {
                type: Date,
                required: true
            },
            endDate: {
                type: Date,
                required: true
            },
            certificate: {
                data: {
                    type: Buffer,
                    required: true
                },
                contentType: {
                    type: String,
                    required: true
                }
            }
        }
    ],
    kdpWorkshops: [
        {
            eventType: {
                type: String,
                required: true
            },
            startDate: {
                type: Date,
                required: true
            },
            endDate: {
                type: Date,
                required: true
            },
            forWhom: {
                type: String,
                required: true,
                enum: ['Students', 'Faculties'],
                validate: {
                    validator: function (v) {
                        return ['Students', 'Faculties'].includes(v);
                    },
                    message: 'For whom must be either Students or Faculties'
                }
            },
            conductedOrAttended: {
                type: String,
                required: true,
                enum: ['Conducted', 'Attended'],
                validate: {
                    validator: function (v) {
                        return ['Conducted', 'Attended'].includes(v);
                    },
                    message: 'Must be either Conducted or Attended'
                }
            },
            report: {
                data: {
                    type: Buffer,
                    required: true
                },
                contentType: {
                    type: String,
                    required: true
                }
            }
        }
    ],

    sdpWorkshops: [
        {
            eventType: {
                type: String,
                required: true
            },
            startDate: {
                type: Date,
                required: true
            },
            endDate: {
                type: Date,
                required: true
            },
            forWhom: {
                type: String,
                required: true,
                enum: ['Students', 'Faculties'],
                message: 'For whom must be either Students or Faculties'
            },
            conductedOrAttended: {
                type: String,
                required: true,
                enum: ['Conducted', 'Attended'],
                message: 'Must be either Conducted or Attended'
            },
            report: {
                data: {
                    type: Buffer, // Binary data for PDF file
                    required: true
                },
                contentType: {
                    type: String, // MIME type (e.g., 'application/pdf')
                    required: true
                }
            }
        }
    ],
    
    publications: [
        {
            conference: {
                type: String,
                required: true,
                enum: ['Conference Paper', 'Journal Paper'], 
                message: 'Conference must be either Conference Paper or Journal Paper'
            },
            facultyName: {
                type: String,
                required: true
            },
            conferenceOrJournalName: {
                type: String,
                required: true
            },
            isbn: {
                type: String,
                required: true
            },
            issue: {
                type: String,
                required: true
            },
            volume: {
                type: String,
                required: true
            },
            year: {
                type: Number,
                required: true,
                validate: {
                    validator: function (v) {
                        return v >= 1900 && v <= new Date().getFullYear();
                    },
                    message: 'Year must be between 1900 and the current year'
                }
            }
        }
    ]
});

const Professor = mongoose.model('Professor', professorSchema);

module.exports = Professor;
