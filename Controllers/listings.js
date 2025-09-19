const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}, }).populate("owner");
    if(!listing) {
        req.flash("error", "Listing does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;      // This is the URL from Cloudinary
    let filename = req.file.filename;  // This is the filename for Cloudinary storage
    console.log("Cloudinary URL:", url, "Filename:", filename); 
        if (!req.body.listing || !req.file) {
           req.flash("error", "Missing required fields!");
           return res.redirect("/listings/new");
        }
        try {
        const newListing = new Listing({
            ...req.body.listing, // Other listing data
            image: {
                url: url,       // Save the Cloudinary URL here
                filename: filename,  // Save the filename here
            },
            owner: req.user._id, // Add owner
        });
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
        } catch (err) {
        console.error("Error creating listing:", err);
        req.flash("error", "Failed to create listing.");
        res.redirect("/listings/new");
        }
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,e_blur:100");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    console.log("Full Request Body:", req.body); // Log the request body to see what's inside
    console.log("Uploaded File:", req.file); // Log the file to check if it's being uploaded

    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
  
    const { listing: listingData } = req.body;
    const updatedData = {
    title: listingData.title || listing.title,
    description: listingData.description || listing.description,
    price: listingData.price || listing.price,
    location: listingData.location || listing.location,
    country: listingData.country || listing.country
};
Object.assign(listing, updatedData);

    // Check if an image file is uploaded
    if (req.file) {
        // If a file is uploaded, update the image
        listing.image = { url: req.file.path, filename: req.file.filename };
    } else if (!listing.image?.url && !req.body.listing.image?.url) {
        // If no image is provided, and the listing doesn't already have an image, show error
        req.flash("error", "Image is required!");
        return res.redirect(`/listings/${id}/edit`);
    }

    await listing.save();
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);

    module.exports.destroyListing = async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing deleted!");
        res.redirect("/listings");
    };
};


