
const mongoose = require('mongoose');
const cors = require('cors');
const EmployeeModel = require('./models/Employee');
const NewsModel = require('./models/News');
const CareerModel = require('./models/Career');
const FittingModel = require('./models/Fitting');
const DealerModel = require('./models/Dealer');
const MessageModel = require('./models/Message');
const ResourceModel = require('./models/Resource');
const VideoModel = require('./models/Video');
const PipeQuote = require('./models/PipeQuote');
const { User } = require('./models/User');
const AdminModel = require('./models/Admin');
const Token = require("./models/Token");
const Email =require("./utils/Email")

const crypto = require("crypto");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const Joi = require("joi");
require('dotenv').config();


const multer = require('multer');
const fs = require('fs');
const express = require('express');
const path = require('path');
const { log } = require('console');

const app = express();
const corsOptions = {
    origin: 'https://client-gules-mu.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  
app.use(cors(corsOptions));
app.use(express.json());

// Add this middleware to set CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://client-gules-mu.vercel.app'); // Replace this with your Vercel domain
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
 

const hashPassword = async (password) => {
    const saltRounds = 10; // Number of salt rounds
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

// Your Express app setup and routes...

// Export the function to use it in other files
module.exports = hashPassword;

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token is missing' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
      req.userId = decoded.id;
      next();
    });
  };
  
// Attempt to connect to the MongoDB database
try {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser:true,
        useUnifiedTopology:true
    });
    // If the connection is successful, log a success message
    console.log("Connected to MongoDB");
} catch (error) {
    // If there is an error, log the error message
    console.error("Error connecting to MongoDB:", error.message);
}

// multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


/////////////////////////////////////////////////////Employee/////////////////////////////////////////////////

// Get Route for listing the content 
app.get('/admin/employee', (req, res) => {
    EmployeeModel.find({})
        .then(employees => res.json(employees))
        .catch(err => res.json(err));
});

// Store the content from input 
app.post("/createEmployee", upload.single('file'), (req, res) => {
    const { name, department, jobTitle, email, telegram } = req.body;
    // Check if req.file exists and contains the filename
    const file = req.file ? req.file.filename : null;
    EmployeeModel.create({ name, file, department, jobTitle, email, telegram })
        .then(employees => res.json(employees))
        .catch(err => res.json(err));
});
app.post("/admin/employee/upload", upload.single('file'), (req, res) => {
    console.log(req.body);
    console.log(req.file);
});

// get user by id 
app.get('/admin/employee/getUser/:id', (req, res) => {
    const id = req.params.id;
    EmployeeModel.findById({ _id: id })
        .then(employees => res.json(employees))
        .catch(err => res.json(err));
});

// update user
app.put("/updateEmployee/:id", upload.single('file'), async (req, res) => {
    try {
        const id = req.params.id;
        const { name, department, jobTitle, email, telegram } = req.body;

        // Check if req.file exists and contains the filename
        const file = req.file ? req.file.filename : null;

        console.log("Received form data:", { name, file, department, jobTitle, email, telegram });

        // Find the employee to be updated
        const employee = await EmployeeModel.findById({ _id: id });

        // If a new file is provided, delete the old file
        if (req.file && employee.file) {
            const filePath = `./uploads/${employee.file}`;
            fs.unlinkSync(filePath);
        }

        // Update employee information
        const updateData = {
            name, department, jobTitle, email, telegram
        };

        // Only update the file field if a new file is provided
        if (file) {
            updateData.file = file;
        }

        const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
            { _id: id },
            updateData,
            { new: true } // Return the updated employee
        );

        res.json(updatedEmployee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// delete route 
app.delete('/admin/employee/deleteUser/:id', (req, res) => {
    const id = req.params.id;

    // Find the employee to be deleted
    EmployeeModel.findById({ _id: id })
        .then(employee => {
            // Delete the image file associated with the employee
            if (employee.file) {
                const filePath = `./uploads/${employee.file}`;
                fs.unlinkSync(filePath);
            }

            // Delete the employee from MongoDB
            return EmployeeModel.findByIdAndDelete({ _id: id });
        })
        .then(result => res.json(result))
        .catch(err => res.json(err));
});


/////////////////////////////////////////////////////News and Event /////////////////////////////////////////////////

// Store the content from input
app.post("/createNews", upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'photos', maxCount: 10 }]), (req, res) => {
    const { title, status, date, shortDescription, longDescription } = req.body;
    const thumbnailPath = req.files['thumbnail'][0].filename;
    const photosPaths = req.files['photos'].map(photo => photo.filename);

    NewsModel.create({ title, thumbnail: thumbnailPath, photos: photosPaths, status, shortDescription, date, longDescription })
        .then(news => res.json(news))
        .catch(err => res.json(err));
});

// Get Route for listing the content 
app.get('/admin/news', (req, res) => {
    NewsModel.find({})
        .then(news => res.json(news))
        .catch(err => res.json(err));
});



// get user by id 
app.get('/admin/news/getNews/:id', (req, res) => {
    const id = req.params.id;
    NewsModel.findById({ _id: id })
        .then(news => {
            // Format the date to a string, e.g., YYYY-MM-DD
            const formattedNews = {
                ...news.toObject(),
                date: news.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
            };
            res.json(formattedNews);
        })
        .catch(err => res.json(err));
});


app.put("/updateNews/:id", upload.single('thumbnail'), async (req, res) => {
    try {
        const id = req.params.id;
        const { title, status, date, shortDescription, longDescription } = req.body;

        // Check if req.file exists and contains the filename
        const thumbnail = req.file ? req.file.filename : null; // Change from 'thumnail' to 'thumbnail'

        console.log("Received form data:", { title, status, date, shortDescription, longDescription });

        // Find the news to be updated
        const news = await NewsModel.findById({ _id: id });

        // If a new file is provided, delete the old file
        if (req.file && news.thumbnail) {
            const thumbnailPath = `./uploads/${news.thumbnail}`;
            fs.unlinkSync(thumbnailPath);
        }

        // Update news information
        const updateData = {
            title, status, date, shortDescription, longDescription
        };

        // Only update the thumbnail field if a new file is provided
        if (thumbnail) {
            updateData.thumbnail = thumbnail;
        }

        const updatedNews = await NewsModel.findByIdAndUpdate(
            { _id: id },
            updateData,
            { new: true } // Return the updated news
        );

        res.json(updatedNews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// delete route 
app.delete('/admin/news/deleteNews/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // Find the news to be deleted
        const news = await NewsModel.findById({ _id: id });

        // Delete the thumbnail associated with the news
        if (news.thumbnail) {
            const thumbnailPath = `./uploads/${news.thumbnail}`;
            fs.unlinkSync(thumbnailPath);
        }

        // Delete the photos associated with the news
        if (news.photos && news.photos.length > 0) {
            news.photos.forEach(photo => {
                const photoPath = `./uploads/${photo}`;
                fs.unlinkSync(photoPath);
            });
        }

        // Delete the news from MongoDB
        const result = await NewsModel.findByIdAndDelete({ _id: id });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




//////////////////////////////////////////////Career///////////////////////////////////////////////////////////////

// Store the content from input
app.post("/createCareer", upload.none(), (req, res) => {
    const { title, description, jobType, salary, experience, position, deadline, role, requirement } = req.body;

    CareerModel.create({
        title,
        description,
        jobType,
        salary,
        experience,
        position,
        deadline,
        role,
        requirement
    })
    .then(career => res.json(career))
    .catch(err => res.json(err));
    console.log(req.body);
});

// Get Route for listing the content
app.get('/admin/career', (req, res) => {
    CareerModel.find({})
        .then(careers => res.json(careers))
        .catch(err => res.json(err));
});

// Get career by id
app.get('/admin/career/getCareer/:id', (req, res) => {
    const id = req.params.id;
    CareerModel.findById({ _id: id })
        .then(career => res.json(career))
        .catch(err => res.json(err));
});

app.put("/updateCareer/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { title, description, jobType, salary, experience, position, deadline, role, requirement } = req.body;

        // Find the career to be updated
        const career = await CareerModel.findById({ _id: id });

        // Update career information
        const updateData = {
            title,
            description,
            jobType,
            salary,
            experience,
            position,
            deadline,
            role,
            requirement
        };

        const updatedCareer = await CareerModel.findByIdAndUpdate(
            { _id: id },
            updateData,
            { new: true } // Return the updated career
        );

        res.json(updatedCareer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// delete route
app.delete('/admin/career/deleteCareer/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // Delete the career from MongoDB
        const result = await CareerModel.findByIdAndDelete({ _id: id });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//////////////////////////////////////////////////Fitting/////////////////////////////////////////////////////////////

// Create Route
app.post("/createFitting", upload.single('file'), (req, res) => {
    try {
        const { name } = req.body;
        const filePath = req.file ? req.file.filename : null;

        FittingModel.create({ name, file: filePath })
            .then(fitting => res.json(fitting))
            .catch(err => res.json(err));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Route for listing fitting data
app.get('/admin/fitting', (req, res) => {
    FittingModel.find({})
        .then(fittings => res.json(fittings))
        .catch(err => res.json(err));
});

// Get fitting by ID
app.get('/admin/fitting/getFitting/:id', (req, res) => {
    const id = req.params.id;
    FittingModel.findById({ _id: id })
        .then(fitting => res.json(fitting))
        .catch(err => res.json(err));
});

// Update Route
app.put("/updateFitting/:id", upload.single('file'), async (req, res) => {
    try {
        const id = req.params.id;
        const { name } = req.body;

        // Check if req.file exists and contains the filename
        const file = req.file ? req.file.filename : null;

        // Find the fitting to be updated
        const fitting = await FittingModel.findById({ _id: id });

        // If a new file is provided, delete the old file
        if (req.file && fitting.file) {
            const filePath = `./uploads/${fitting.file}`;
            fs.unlinkSync(filePath);
        }

        // Update fitting information
        const updateData = {
            name
        };

        // Only update the file field if a new file is provided
        if (file) {
            updateData.file = file;
        }

        const updatedFitting = await FittingModel.findByIdAndUpdate(
            { _id: id },
            updateData,
            { new: true } // Return the updated fitting
        );

        res.json(updatedFitting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete Route
app.delete('/admin/fitting/deleteFitting/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // Find the fitting to be deleted
        const fitting = await FittingModel.findById({ _id: id });

        // Delete the file associated with the fitting
        if (fitting.file) {
            const filePath = `./uploads/${fitting.file}`;
            fs.unlinkSync(filePath);
        }

        // Delete the fitting from MongoDB
        const result = await FittingModel.findByIdAndDelete({ _id: id });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

///////////////////////////////////Dealer////////////////////////////////////////////

//create dealer 

app.post("/createDealer", upload.none(), (req, res) => {
    const { name, mobile, email, role, products, province } = req.body;

    DealerModel.create({
        name,
        mobile,
        email,
        role,
        products,
        province,
    })
    .then(dealer => res.json(dealer))
    .catch(err => res.json(err));

    console.log(req.body);
});

app.get('/admin/dealer', (req, res) => {
    DealerModel.find({})
        .then(dealer => res.json(dealer))
        .catch(err => res.json(err));
});


// delete route
app.delete('/admin/dealer/deleteDealer/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // Delete the career from MongoDB
        const result = await DealerModel.findByIdAndDelete({ _id: id });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

////////////////////////////////Message/////////////////////////////////////////

app.post("/createMessage", upload.none(), (req, res) => {
    const { name, email, number, message } = req.body;

    MessageModel.create({
        name,
        email,
        number,
        message,
    })
    .then(message => res.json(message))
    .catch(err => res.json(err));

    console.log(req.body);
});

app.get('/admin/messages', (req, res) => {
    MessageModel.find({})
        .then(messages => res.json(messages))
        .catch(err => res.json(err));
});

// delete route
app.delete('/admin/message/deleteMessage/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // Delete the message from MongoDB
        const result = await MessageModel.findByIdAndDelete({ _id: id });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

///////////////////////////////Resource/////////////////////////////////////////////////

app.post("/createResource", async (req, res) => {
    try {
        const { title, link } = req.body; // Change from title and filePath to title and link

        const resource = await ResourceModel.create({ title, link });

        res.json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get All Resources
app.get('/admin/resources', async (req, res) => {
    try {
        const resources = await ResourceModel.find({});
        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Resource by ID and Serve File
app.get('/admin/resource/getResource/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const resource = await ResourceModel.findById(id);

        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        const link = resource.link;
        // Here you can handle serving the file based on the link provided
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete Resource
app.delete('/admin/resource/deleteResource/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await ResourceModel.findByIdAndDelete(id);

        res.json({ message: "Resource deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

////////////////////////////////////Video///////////////////////////////////////////////////
app.post("/createVideo", (req, res) => {
    try {
        const { title, link, description } = req.body;

        VideoModel.create({ title, link, description })
            .then(video => res.json(video))
            .catch(err => res.json(err));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get All Videos
app.get('/admin/videos',(req, res) => {
    VideoModel.find({})
        .then(videos => res.json(videos))
        .catch(err => res.json(err));
});

// Get Video by ID
app.get('/admin/video/getVideo/:id',(req, res) => {
    const id = req.params.id;

    VideoModel.findById({ _id: id })
        .then(video => res.json(video))
        .catch(err => res.json(err));
});

// Delete Video
app.delete('/admin/video/deleteVideo/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await VideoModel.findByIdAndDelete({ _id: id });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put('/updateVideo/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { title, description, link } = req.body;

        // Find the video to be updated
        const video = await VideoModel.findById({ _id: id });

        // Update video information
        const updateData = {
            title,
            description,
            link
        };

        const updatedVideo = await VideoModel.findByIdAndUpdate(
            { _id: id },
            updateData,
            { new: true } // Return the updated video
        );

        res.json(updatedVideo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

////////////////////////////////Admin Login /////////////////////////////////////////////
app.post("/admin/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Ensure both username and password are provided
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = new AdminModel({
            username,
            password: hashedPassword
        });

        // Save admin to the database
        await newAdmin.save();

        res.json({
            message: "Admin signup successful",
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




app.post("/admin/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await AdminModel.findOne({ username });
  
      if (!user) {
        return res.status(400).json({ msg: "User does not exist" });
      }
  
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Failed to compare passwords" });
        }
        console.log(result);
        if (result) {
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h", // Token expires in 1 hour
          });
  
          return res.status(200).json({ token, msg: "Login successful" });
        } else {
          return res.status(401).json({ msg: "Wrong pass" });
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to login user" });
    }
  });
  

//////////////////////////////////Request Quote/////////////////////////////////////////

app.post('/createQuote', async (req, res) => {
    try {
        const { message } = req.body;

        // Create a new PipeQuote document with the message
        const newPipeQuote = await PipeQuote.create({ message });

        res.status(201).json(newPipeQuote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

///////////////////////////Register////////////////////////////////////////////////

app.post("/register", async (req, res) => {
    try {
        // Validate user input
        const { error } = validateRegister(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        // Check if user with given email already exists
        let user = await User.findOne({ email: req.body.email });
        if (user)
            return res.status(409).send({ message: "User with given email already exists!" });

        // Hash the password
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        // Create and save the new user
        user = await new User({ ...req.body, password: hashPassword }).save();

        // Generate verification token
        const token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();

        // Construct verification email
        const verificationLink = `${process.env.BASE_URL}/verify-email/${token.token}`;
        const emailSubject = "Verify Your Email Address";
        const emailText = `Hello ${user.firstName},\n\nPlease click the following link to verify your email address:\n${verificationLink}\n\nThank you,\nThe Application Team`;

        // Send verification email
        await Email(user.email, emailSubject, emailText);

        res.status(201).send({ message: "An email has been sent to your account. Please verify your email address." });
    } catch (error) {
        console.error("Error in user registration:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Validate user registration input
const validateRegister = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().required().label("First Name"),
        lastName: Joi.string().required().label("Last Name"),
        email: Joi.string().email().required().label("Email"),
        number: Joi.string().required().label("Number"),
        password: Joi.string().required().label("Password"),
    });
    return schema.validate(data);
};

// Verify user's email
app.get("/verify-email/:token", async (req, res) => {
    try {
        // Find the token in the database
        const token = await Token.findOne({ token: req.params.token });
        if (!token) return res.status(400).send({ message: "Invalid or expired verification link." });

        // Find the user associated with the token
        const user = await User.findById(token.userId);
        if (!user) return res.status(400).send({ message: "User not found." });

        // Update user's email verification status
        user.emailVerified = true;
        await user.save();

        // Delete the verification token from the database
        await token.deleteOne();

        res.status(200).send({ message: "Email verified successfully. You can now login." });
    } catch (error) {
        console.error("Error in email verification:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});




///////////////////Login///////////////////////////////////////////////////////

app.post("/login", async (req, res) => {
    try {
        const { error } = validateLogin(req.body); // Use validateLogin here
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(401).send({ message: "Invalid Email or Password" });

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword)
            return res.status(401).send({ message: "Invalid Email or Password" });

        const token = user.generateAuthToken();
        res.status(200).send({ data: token, message: "logged in successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
    });
    return schema.validate(data);
};


////////////////////////////////////////////////////////////////////////////////
app.listen(3003, () => {
    console.log("Server is Running on Port 3002");
});


