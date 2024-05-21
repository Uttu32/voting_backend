const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Candidate = require("../models/candidate");
const { jwtAuthMiddleware } = require("../jwt");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (user.role == "admin") return true;
  } catch (error) {
    return false;
  }
};

router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(400).json({ message: "user does not have admin role" });
    }

    const data = req.body;
    console.log(data);
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    res.status(200).json({ response: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.post('/', jwtAuthMiddleware, async (req, res) =>{
//   try{
//       console.log("ye dekh ", req.user.id);
//       if(!(await checkAdminRole(req.user.id)))
//           return res.status(403).json({message: 'user does not have admin role'});

//       const data = req.body // Assuming the request body contains the candidate data

//       // Create a new User document using the Mongoose model
//       const newCandidate = new Candidate(data);

//       // Save the new user to the database
//       const response = await newCandidate.save();
//       console.log('data saved');
//       res.status(200).json({response: response});
//   }
//   catch(err){
//       console.log(err);
//       res.status(500).json({error: 'Internal Server Error'});
//   }
// })  

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(400).json({ message: "user does not have admin role" });
    }
    const candidateId = req.params;
    const updateCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updateCandidateData,
      {
        new: true,
        runValidator: true,
      }
    );

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(400).json({ message: "user does not have admin role" });
    }
    const candidateId = req.params;
    const response = await Candidate.FindByIdAndDelete(candidateId);
    if (!response) {
      res.status(404).json({ error: "Candidate not found" });
    }

    console.log(response, "hhhhhhh Candidate deleted");
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Let's start Voting
router.get("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  const candidateId = req.params.candidateId;
  const userId = req.user.id;
  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role == "admin") {
      return res.status(403).json({ message: "admin is not allowed" });
    }
    if (user.isVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }

    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();

    return res.status(200).json({ message: "Vote recorded successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// vote count
router.get("/votes/count", async (req, res) => {
  try {
    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });

    return res.status(200).json(voteRecord);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    // Find all candidates and select only the name and party fields, excluding _id
    const candidates = await Candidate.find({}, "name party -_id");

    // Return the list of candidates
    res.status(200).json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getallData", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.role !== "admin") {
      return res
        .status(404)
        .json({ error: "Invalid try!!! only admin is allowed to see data" });
    }

    const candidate = await Candidate.find();

    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
