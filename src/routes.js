"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        
        let empty = false
        //console.log(req.body)

        if(!req.body) {
            res.status(500).send("Please provide a name and list of seasons for the doctor")
            empty = true
        }
        if(!req.body.name) {
            res.status(500).send("Please provide a name for the doctor")
            empty = true
        }
        if(!req.body.seasons) {
            res.status(500).send("Please provide a list of seasons for the doctor")
            empty = true
        }

        if(empty == false) {

            const newDoc = req.body;
            
            Doctor.find({})
            .then(data => {
                newDoc.doc_id = "d" + (data.length + 1)
                Doctor.create(newDoc).save().then(response => {
                    res.status(201).send(response)
                }).catch(err => {
                    res.status(500).send(err)
                });
            }).catch(err => {
                res.status(500).send(err)
            });
        } 
        
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        res.status(501).send();
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);

        Doctor.findById(req.params.id)
        .then(data => {
            res.status(200).send(data)
        }).catch(err =>{
            res.status(404).send("Doctor with id " + req.params.id + " not found.")
        })
        
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);

        Doctor.findById(req.params.id)
        .then(doc => {
            Doctor.findOneAndUpdate(
                { _id: req.params.id }, 
                {
                    "name": req.body.name ? req.body.name : doc.name,
                    "seasons": req.body.seasons ? req.body.seasons : doc.seasons,
                },
                { new: true } // means you want to return the updated artist
            ).then(newDoc =>
                {
                    res.status(200).send(newDoc)
                }).catch(err => {
                    res.status(404).send(err)
                })
            
        }).catch(err =>{
            res.status(404).send("Doctor with id " + req.params.id + " not found.")
        })

        
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        Doctor.findOneAndDelete({ _id: req.params.id }).then(response => {
                res.status(200).send(null);
        }).catch(err => {
            res.status(404).send("Delete doctor failed");
        })
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);

        Doctor.findById(req.params.id)
        .then(response => {
            Companion.find({})
            .then(data => {
                let companions = []

                for (let i = 0; i < data.length; i++)
                {
                    for (let j = 0; j < data[i].doctors.length; j++)
                    {
                        if (data[i].doctors[j] == req.params.id)
                        {
                            companions.push(data[i])
                        }
                    }
                }
                res.status(200).send(companions)
            })
            .catch(err =>{
                res.status(404).send(err)
            })
        }).catch(err =>{
            res.status(404).send("Doctor with id " + req.params.id + " not found.")
        })
        
        
        
    });
    

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        Doctor.findById(req.params.id)
        .then(response => {
            Companion.find({})
            .then(data => {
                let good = true
                for (let i = 0; i < data.length; i++)
                {
                    for (let j = 0; j < data[i].doctors.length; j++)
                    {
                        if (data[i].doctors[j] == req.params.id)
                        {
                            if(data[i].alive == false)
                            {
                                good = false
                            }
                        }
                    }
                }
                res.status(200).send(good)
            })
            .catch(err =>{
                res.status(404).send(err)
            })
        }).catch(err =>{
            res.status(404).send("Doctor with id " + req.params.id + " not found.")
        })
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        res.status(501).send();
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");

        let empty = false

        if(!req.body) {
            res.status(500).send("Please provide a name, character, list of doctors, list of seasons, and alive boolean for the companion")
            empty = true
        }
        if(!req.body.name) {
            res.status(500).send("Please provide a name for the companion")
            empty = true
        }
        if(!req.body.character) {
            res.status(500).send("Please provide a character name for the companion")
            empty = true
        }
        if(!req.body.doctors) {
            res.status(500).send("Please provide a list of doctors for the companion")
            empty = true
        }
        if(!req.body.seasons) {
            res.status(500).send("Please provide a list of seasons for the companion")
            empty = true
        }
        if(!req.body.alive) {
            res.status(500).send("Please provide whether the companion is alive")
            empty = true
        }


        if (empty == false) {
            const newComp = req.body;
            newComp._id = "c" + Date.now()
            //console.log("output", newDoc)

            Companion.create(newComp).save().then(response => {
                res.status(201).send(response)
            }).catch(err => {
                res.status(500).send(err)
            });
                    
        }
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        Companion.find({})
        .then(data => {

            let crossovers = []
            for (let i = 0; i < data.length; i++)
            {
                if (data[i].doctors.length >= 2)
                {
                    crossovers.push(data[i])
                }
            }
            res.status(200).send(crossovers)
        }).catch(err =>{
            res.status(404).send(err)
        })
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        res.status(501).send();
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
        .then(data => {
            res.status(200).send(data)
        }).catch(err =>{
            res.status(404).send("Companion with id " + req.params.id + " not found.")
        })
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);

        Companion.findById(req.params.id)
        .then(comp => {
            Companion.findOneAndUpdate(
                { _id: req.params.id }, 
                {
                    "name": req.body.name ? req.body.name : comp.name,
                    "character": req.body.character ? req.body.character : comp.character,
                    "doctors": req.body.doctors ? req.body.doctors : comp.doctors,
                    "seasons": req.body.seasons ? req.body.seasons : comp.seasons,
                    "alive": req.body.alive ? req.body.alive : comp.alive
                },
                { new: true } // means you want to return the updated artist
            ).then(response =>
                {
                    res.status(200).send(response)
                }).catch(err => {
                    res.status(404).send(err)
                })
            
        }).catch(err =>{
            res.status(404).send("Doctor with id " + req.params.id + " not found.")
        })
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        Companion.findOneAndDelete({ _id: req.params.id }).then(response => {
            //console.log("response ----------- ", response)
            if (response) {
                res.status(200).send(null);
            }
        }).catch(err => {
            res.status(404).send("Delete companion failed");
        })
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        let compDoctors = []
        Companion.findById(req.params.id)
        .then(comp => {
            compDoctors = comp.doctors
            //console.log(compDoctors)

            Doctor.find({})
            .then(data => {
                let doctorsList = []
                //console.log(data)
                //onsole.log(compDoctors.length)

                for (let i = 0; i < data.length; i++)
                {
                    for (let j = 0; j < compDoctors.length; j++)
                    {
                        //console.log("compDoctor", compDoctors[j])
                        //console.log("data", data[i]._id)
                        if (compDoctors[j] == (String)(data[i]._id))
                        {
                            doctorsList.push(data[i])
                        }
                    }
                }
                //console.log("doctors", doctorsList)
                res.status(200).send(doctorsList)
            })
            .catch(err => {
                res.status(500).send(err);
            });

        }).catch(err =>{
            res.status(404).send("Companion with id " + req.params.id + " not found.")
        })
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        
        Companion.findById(req.params.id)
        .then(comp => {
            let compSeasons = comp.seasons

            Companion.find({}).then(data => {
                let friends = []

                for (let i = 0; i < data.length; i++)
                {
                    for (let j = 0; j < data[i].seasons.length; j++)
                    {
                        for (let k = 0; k < compSeasons.length; k++)
                        {
                            if (data[i].seasons[j] == compSeasons[k] && data[i]._id != req.params.id)
                            {
                                friends.push(data[i])
                            }
                        }
                    }
                }

                res.status(200).send([...new Set(friends)])
            })
        }).catch(err =>{
            res.status(404).send("Companion with id " + req.params.id + " not found.")
        })
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        res.status(501).send();
    });

module.exports = router;