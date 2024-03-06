


require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const EmployeeModel = require('./models/Employee');
const NewsModel = require('./models/News');
const CareerModel = require('./models/Career');
const FittingModel = require('./models/Fitting');
const DealerModel = require('./models/Dealer');
const multer = require('multer');
const fs = require('fs');
const express = require('express');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());


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


app.listen(3002, () => {
    console.log("Server is Running");
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