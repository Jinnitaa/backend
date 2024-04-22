
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
const cloudinary=require("./utils/cloudinary")

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
const { append } = require('express/lib/response');

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

const uploads = multer({ dest: '/var/data' });

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

app.post("/createNews", upload.array('photos'), async (req, res) => {
    try {
        const { title, status, shortDescription, longDescription, date } = req.body;

        // Upload photos to Cloudinary
        const photoUrls = await Promise.all(req.files.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path, { folder: 'News' });
            return { url: result.secure_url, public_id: result.public_id }; // Include public_id
        }));

        // Create news document with Cloudinary URLs and public IDs
        const news = await NewsModel.create({
            title,
            status,
            thumbnail: { url: photoUrls[0].url, public_id: photoUrls[0].public_id }, // Include public_id for thumbnail
            photos: photoUrls, // Correctly assign photoUrls array to photos field
            shortDescription,
            longDescription,
            date // Already converted to Date object by front end
        });

        // Send the Cloudinary URLs and public IDs in the response
        res.json({ 
            title: news.title,
            status: news.status,
            thumbnail: news.thumbnail,
            photos: news.photos,
            shortDescription: news.shortDescription,
            longDescription: news.longDescription
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Get Route for listing news and events data
app.get('/admin/news', async (req, res) => {
    try {
        // Fetch all news documents from the database
        const news = await NewsModel.find({});

        // Send the news as a JSON response
        res.json(news);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Route for fetching a single news or event by ID
app.get("/getNews/:id", async (req, res) => {
    try {
        const id = req.params.id;
        // Find the news or event by ID
        const news = await NewsModel.findById(id);
        if (!news) {
            return res.status(404).json({ error: "News or event not found" });
        }
        // Send the news data as a JSON response
        res.json(news);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update Route for updating news and event information
app.put("/updateNews/:id", upload.array('photos'), async (req, res) => {
    try {
        const id = req.params.id;
        const { title, status, shortDescription, longDescription } = req.body;

        // Find the news or event to be updated
        const news = await NewsModel.findById(id);

        if (!news) {
            return res.status(404).json({ error: "News or event not found" });
        }

        // If new photos are provided, upload them to Cloudinary
        if (req.files && req.files.length > 0) {
            const photoUrls = await Promise.all(req.files.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path, { folder: 'News' });
                return result.secure_url;
            }));
            // Update photos with the new ones
            news.photos = photoUrls;
        }

        // Update news or event information
        news.title = title;
        news.status = status;
        news.shortDescription = shortDescription;
        news.longDescription = longDescription;

        // Save the updated news or event
        await news.save();

        res.json(news);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete Route for deleting news and event by ID
app.delete("/deleteNews/:id", async (req, res) => {
    try {
        const id = req.params.id;
        // Find the news or event by ID and delete it
        const deletedNews = await NewsModel.findByIdAndDelete(id);
        if (!deletedNews) {
            return res.status(404).json({ error: "News or event not found" });
        }

        // Send success response
        res.json({ message: "News or event deleted successfully" });
    } catch (error) {
        console.error(error);
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
app.post("/createFitting", upload.single('file'), async (req, res) => {
    try {
        const { name } = req.body;

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'Fitting' });

        // Create fitting document with Cloudinary URL
        const fitting = await FittingModel.create({
            name,
            file: {
                public_id: result.public_id,
                url: result.secure_url
            }
        });

        // Send the Cloudinary URL in the response
        res.json({ 
            name: fitting.name,
            fileUrl: fitting.file.url // Assuming 'file' contains the URL of the uploaded file
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Get Route for listing fitting data
app.get('/admin/fitting', async (req, res) => {
    try {
        // Fetch all fitting documents from the database
        const fittings = await FittingModel.find({});

        // Map fittings to include the Cloudinary URL of the uploaded image
        const fittingsWithUrls = fittings.map(fitting => {
            return {
                _id: fitting._id,
                name: fitting.name,
                fileUrl: fitting.file.url // Assuming 'file' contains the URL of the uploaded file
            };
        });

        // Send the fittings with Cloudinary URLs as a JSON response
        res.json(fittingsWithUrls);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Route for fetching a single fitting by ID
app.get("/getFitting/:id", async (req, res) => {
    try {
        const id = req.params.id;
        // Find the fitting by ID
        const fitting = await FittingModel.findById(id);
        if (!fitting) {
            return res.status(404).json({ error: "Fitting not found" });
        }
        // Send the fitting data as a JSON response
        res.json({ 
            _id: fitting._id,
            name: fitting.name,
            fileUrl: fitting.file.url
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update Route for updating fitting information
app.put("/updateFitting/:id", upload.single('file'), async (req, res) => {
    try {
        const id = req.params.id;
        const { name } = req.body;

        // Find the fitting to be updated
        const fitting = await FittingModel.findById(id);

        if (!fitting) {
            return res.status(404).json({ error: "Fitting not found" });
        }

        // If a new file is provided, upload it to Cloudinary
        let fileUrl = fitting.file.url;
        let public_id = fitting.file.public_id;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'Fitting' });
            fileUrl = result.secure_url;
            public_id = result.public_id;

            // If there was an existing image, delete it from Cloudinary
            if (fitting.file.public_id) {
                await cloudinary.uploader.destroy(fitting.file.public_id);
            }
        }

        // Update fitting information
        fitting.name = name;
        fitting.file.url = fileUrl;
        fitting.file.public_id = public_id; // Update public_id if new image uploaded
        await fitting.save();

        res.json({ 
            name: fitting.name,
            fileUrl: fitting.file.url
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.delete("/deleteFitting/:id", async (req, res) => {
    try {
        const id = req.params.id;
        // Find the fitting by ID and delete it
        const deletedFitting = await FittingModel.findByIdAndDelete(id);
        if (!deletedFitting) {
            return res.status(404).json({ error: "Fitting not found" });
        }

        // If there was an existing image, delete it from Cloudinary
        if (deletedFitting.file.public_id) {
            await cloudinary.uploader.destroy(deletedFitting.file.public_id);
        }

        // Send success response
        res.json({ message: "Fitting deleted successfully" });
    } catch (error) {
        console.error(error);
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

app.get('/getQuotes', async (req, res) => {
    try {
        // Find all PipeQuote documents in the database
        const quotes = await PipeQuote.find({});

        res.status(200).json(quotes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.delete('/deleteQuote/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the quote by ID and delete it
      await PipeQuote.findByIdAndDelete(id);
  
      res.status(200).json({ message: 'Quote deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  



////////////////////////////////////////////////////////////////////////////////
app.listen(3003, () => {
    console.log("Server is Running on Port 3002");
});


