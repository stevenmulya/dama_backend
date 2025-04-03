require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const storage = supabase.storage;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Multer Configuration
const storageConfig = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

const VALID_WORK_CATEGORIES = [
    "Start Up Package",
    "Brand Management",
    "Brand Consultation",
    "Collection Development",
    "TikTok Management",
    "Social Media Management",
    "Styling & Creative Direction",
    "Fabric Sourcing & Consulting"
];

// Fungsi untuk mengunggah MyServices ke Supabase Storage
async function uploadServicesToSupabase(file, filePath) {
    try {
        const { error, data } = await storage
            .from('servicesbucket')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) {
            console.error('Supabase Storage Error:', error);
            return null;
        }

        return `${supabaseUrl}/storage/v1/object/public/servicesbucket/${filePath}`;
    } catch (error) {
        console.error("Error uploading to Supabase Storage:", error);
        return null;
    }
}

// Fungsi untuk upload file ke Supabase Storage
async function uploadWorksToSupabase(file, filePath) {
    try {
        const { error, data } = await supabase
            .storage
            .from('worksbucket')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) {
            console.error('Supabase Storage Error:', error);
            return null;
        }

        return `${supabaseUrl}/storage/v1/object/public/worksbucket/${filePath}`;
    } catch (error) {
        console.error('Error uploading to Supabase Storage:', error);
        return null;
    }
}



// Fungsi untuk mengunggah file ke Supabase Storage
async function uploadBlogsToSupabase(file, filePath) {
    try {
        const { error, data } = await storage
            .from('blogsbucket')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) {
            console.error('Supabase Storage Error:', error);
            return null;
        }

        return `${supabaseUrl}/storage/v1/object/public/blogsbucket/${filePath}`;
    } catch (error) {
        console.error("Error uploading to Supabase Storage:", error);
        return null;
    }
}

// Function to upload file to Supabase Storage
async function uploadFileToSupabase(file, filePath) {
    try {
        const { error, data } = await storage
            .from('homebucket') // Use the new bucket name
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) {
            console.error('Supabase Storage Error:', error);
            return null;
        }

        return `${supabaseUrl}/storage/v1/object/public/homebucket/${filePath}`; // Use the new bucket name
    } catch (error) {
        console.error("Error uploading to Supabase Storage:", error);
        return null;
    }
}

// --------------------- TAGLINE CRUD ---------------------

// Create a tagline (with image upload)
app.post('/taglines', upload.single('tagline_img'), async (req, res) => {
    try {
        const { tagline_text, tagline_sub_text } = req.body;

        let tagline_img = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            tagline_img = await uploadFileToSupabase(req.file, filePath);
            if (!tagline_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('taglines')
            .insert([{ tagline_img, tagline_text, tagline_sub_text }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all taglines
app.get('/taglines', async (req, res) => {
    const { data, error } = await supabase.from('taglines').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single tagline
app.get('/taglines/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('taglines').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a tagline (with image upload)
app.put('/taglines/:id', upload.single('tagline_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { tagline_text, tagline_sub_text } = req.body;

        let updateData = { tagline_text, tagline_sub_text };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const tagline_img = await uploadFileToSupabase(req.file, filePath);
            if (!tagline_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.tagline_img = tagline_img;
        }

        const { data, error } = await supabase
            .from('taglines')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a tagline
app.delete('/taglines/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('taglines').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Tagline deleted', data });
});

// --------------------- TOSERVICES CRUD ---------------------

// Create a toservice (with image upload)
app.post('/toservices', upload.single('toservices_img'), async (req, res) => {
    try {
        const { toservices_text } = req.body;

        let toservices_img = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            toservices_img = await uploadFileToSupabase(req.file, filePath);
            if (!toservices_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('toservices')
            .insert([{ toservices_img, toservices_text }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all toservices
app.get('/toservices', async (req, res) => {
    const { data, error } = await supabase.from('toservices').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single toservice
app.get('/toservices/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('toservices').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a toservice (with image upload)
app.put('/toservices/:id', upload.single('toservices_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { toservices_text } = req.body;

        let updateData = { toservices_text };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const toservices_img = await uploadFileToSupabase(req.file, filePath);
            if (!toservices_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.toservices_img = toservices_img;
        }

        const { data, error } = await supabase
            .from('toservices')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a toservice
app.delete('/toservices/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('toservices').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'TOService deleted', data });
});


// --------------------- CLIENTLOGO CRUD ---------------------

// Create a clientlogo (with image upload)
app.post('/ourclients', upload.single('client_logo_img'), async (req, res) => {
    try {
        const { client_name, client_link } = req.body;

        let client_logo_img = null;
        if (req.file) {
            const filePath = `ourclients/${Date.now()}${path.extname(req.file.originalname)}`;
            client_logo_img = await uploadFileToSupabase(req.file, filePath);
            if (!client_logo_img) {
                return res.status(500).json({ error: 'Failed to upload client logo image' });
            }
        }

        const { data, error } = await supabase
            .from('ourclients')
            .insert([{ client_logo_img, client_name, client_link }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all clientlogos
app.get('/ourclients', async (req, res) => {
    const { data, error } = await supabase.from('ourclients').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single clientlogo
app.get('/ourclients/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('ourclients').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a clientlogo (with image upload)
app.put('/ourclients/:id', upload.single('client_logo_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { client_name, client_link } = req.body;

        let updateData = { client_name, client_link };

        if (req.file) {
            const filePath = `ourclients/${Date.now()}${path.extname(req.file.originalname)}`;
            const client_logo_img = await uploadFileToSupabase(req.file, filePath);
            if (!client_logo_img) {
                return res.status(500).json({ error: 'Failed to upload client logo image' });
            }
            updateData.client_logo_img = client_logo_img;
        }

        const { data, error } = await supabase
            .from('ourclients')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a clientlogo
app.delete('/ourclients/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('ourclients').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Client logo deleted', data });
});

// --------------------- TOWORKS CRUD ---------------------

// Create a towork
app.post('/toworks', async (req, res) => {
    try {
        const { toworks_text, toworks_sub_text } = req.body;

        const { data, error } = await supabase
            .from('toworks')
            .insert([{ toworks_text, toworks_sub_text }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all toworks
app.get('/toworks', async (req, res) => {
    const { data, error } = await supabase.from('toworks').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single towork
app.get('/toworks/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('toworks').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a towork
app.put('/toworks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { toworks_text, toworks_sub_text } = req.body;

        const { data, error } = await supabase
            .from('toworks')
            .update({ toworks_text, toworks_sub_text })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a towork
app.delete('/toworks/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('toworks').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Towork deleted', data });
});

// --------------------- TESTIMONIALS CRUD ---------------------

// Create a testimonial (with image upload)
app.post('/testimonials', upload.single('testimonial_img'), async (req, res) => {
    try {
        const { testimonial_from, testimonial_text } = req.body;

        let testimonial_img = null;
        if (req.file) {
            const filePath = `testimonials/${Date.now()}${path.extname(req.file.originalname)}`;
            testimonial_img = await uploadFileToSupabase(req.file, filePath);
            if (!testimonial_img) {
                return res.status(500).json({ error: 'Failed to upload testimonial image' });
            }
        }

        const { data, error } = await supabase
            .from('testimonials')
            .insert([{ testimonial_from, testimonial_text, testimonial_img }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all testimonials
app.get('/testimonials', async (req, res) => {
    const { data, error } = await supabase.from('testimonials').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single testimonial
app.get('/testimonials/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('testimonials').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a testimonial (with image upload)
app.put('/testimonials/:id', upload.single('testimonial_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { testimonial_from, testimonial_text } = req.body;

        let updateData = { testimonial_from, testimonial_text };

        if (req.file) {
            const filePath = `testimonials/${Date.now()}${path.extname(req.file.originalname)}`;
            const testimonial_img = await uploadFileToSupabase(req.file, filePath);
            if (!testimonial_img) {
                return res.status(500).json({ error: 'Failed to upload testimonial image' });
            }
            updateData.testimonial_img = testimonial_img;
        }

        const { data, error } = await supabase
            .from('testimonials')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a testimonial
app.delete('/testimonials/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('testimonials').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Testimonial deleted', data });
});

// --------------------- CONNECT CRUD ---------------------

// Create a connect entry (with image upload)
app.post('/connect', upload.single('connect_img'), async (req, res) => {
    try {
        const { connect_text } = req.body;

        let connect_img = null;
        if (req.file) {
            const filePath = `connect/${Date.now()}${path.extname(req.file.originalname)}`;
            connect_img = await uploadFileToSupabase(req.file, filePath);
            if (!connect_img) {
                return res.status(500).json({ error: 'Failed to upload connect image' });
            }
        }

        const { data, error } = await supabase
            .from('connect')
            .insert([{ connect_text, connect_img }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all connect entries
app.get('/connect', async (req, res) => {
    const { data, error } = await supabase.from('connect').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single connect entry
app.get('/connect/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('connect').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a connect entry (with image upload)
app.put('/connect/:id', upload.single('connect_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { connect_text } = req.body;

        let updateData = { connect_text };

        if (req.file) {
            const filePath = `connect/${Date.now()}${path.extname(req.file.originalname)}`;
            const connect_img = await uploadFileToSupabase(req.file, filePath);
            if (!connect_img) {
                return res.status(500).json({ error: 'Failed to upload connect image' });
            }
            updateData.connect_img = connect_img;
        }

        const { data, error } = await supabase
            .from('connect')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a connect entry
app.delete('/connect/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('connect').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Connect entry deleted', data });
});

// --------------------- INSTAGRAMS CRUD ---------------------

// Create an instagram entry (with image upload)
app.post('/instagrams', upload.single('instagram_img'), async (req, res) => {
    try {
        const { instagram_name, instagram_link } = req.body;

        let instagram_img = null;
        if (req.file) {
            const filePath = `instagrams/${Date.now()}${path.extname(req.file.originalname)}`;
            instagram_img = await uploadFileToSupabase(req.file, filePath);
            if (!instagram_img) {
                return res.status(500).json({ error: 'Failed to upload instagram image' });
            }
        }

        const { data, error } = await supabase
            .from('instagrams')
            .insert([{ instagram_img, instagram_name, instagram_link }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all instagram entries
app.get('/instagrams', async (req, res) => {
    const { data, error } = await supabase.from('instagrams').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single instagram entry
app.get('/instagrams/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('instagrams').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update an instagram entry (with image upload)
app.put('/instagrams/:id', upload.single('instagram_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { instagram_name, instagram_link } = req.body;

        let updateData = { instagram_name, instagram_link };

        if (req.file) {
            const filePath = `instagrams/${Date.now()}${path.extname(req.file.originalname)}`;
            const instagram_img = await uploadFileToSupabase(req.file, filePath);
            if (!instagram_img) {
                return res.status(500).json({ error: 'Failed to upload instagram image' });
            }
            updateData.instagram_img = instagram_img;
        }

        const { data, error } = await supabase
            .from('instagrams')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an instagram entry
app.delete('/instagrams/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('instagrams').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Instagram entry deleted', data });
});

// --------------------- DAMA CRUD ---------------------

// Create a dama entry
app.post('/dama', async (req, res) => {
    try {
        const { dama_whatsapp, dama_instagram, dama_linkedin, dama_tiktok } = req.body;

        const { data, error } = await supabase
            .from('dama')
            .insert([{ dama_whatsapp, dama_instagram, dama_linkedin, dama_tiktok }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all dama entries
app.get('/dama', async (req, res) => {
    const { data, error } = await supabase.from('dama').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single dama entry
app.get('/dama/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('dama').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a dama entry
app.put('/dama/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { dama_whatsapp, dama_instagram, dama_linkedin, dama_tiktok } = req.body;

        const { data, error } = await supabase
            .from('dama')
            .update({ dama_whatsapp, dama_instagram, dama_linkedin, dama_tiktok })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a dama entry
app.delete('/dama/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('dama').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Dama entry deleted', data });
});

// --------------------- FAQ CRUD ---------------------

// Create a FAQ entry
app.post('/faq', async (req, res) => {
    try {
        const { faq_question, faq_answer } = req.body;

        const { data, error } = await supabase
            .from('faq')
            .insert([{ faq_question, faq_answer }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all FAQ entries
app.get('/faq', async (req, res) => {
    const { data, error } = await supabase.from('faq').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single FAQ entry
app.get('/faq/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('faq').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a FAQ entry
app.put('/faq/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { faq_question, faq_answer } = req.body;

        const { data, error } = await supabase
            .from('faq')
            .update({ faq_question, faq_answer })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a FAQ entry
app.delete('/faq/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('faq').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'FAQ entry deleted', data });
});


// --------------------- SERVICES_INDIVIDUAL CRUD ---------------------

// Create a services_individual entry (with image upload)
app.post('/services_individual', upload.single('services_individual_img'), async (req, res) => {
    try {
        const { services_individual_name, services_individual_title, services_individual_desc, services_individual_include, order } = req.body;

        let parsedInclude = [];
        try{
            parsedInclude = JSON.parse(services_individual_include);
        } catch (parseError) {
            return res.status(400).json({ error: 'Invalid services_individual_include format. Must be a JSON string.' });
        }

        let services_individual_img = null;
        if (req.file) {
            const filePath = `services_individual/${Date.now()}${path.extname(req.file.originalname)}`;
            services_individual_img = await uploadServicesToSupabase(req.file, filePath);
            if (!services_individual_img) {
                return res.status(500).json({ error: 'Failed to upload services individual image.' });
            }
        }

        const { data, error } = await supabase
            .from('services_individual')
            .insert([{ services_individual_name, services_individual_title, services_individual_desc, services_individual_include: parsedInclude, services_individual_img, order }])
            .select();

        if (error) {
            return res.status(400).json({ error: `Failed to create services individual entry: ${error.message}` });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
});

// Get all services_individual entries
app.get('/services_individual', async (req, res) => {
    const { data, error } = await supabase.from('services_individual').select('*').order('order', { ascending: true });

    if (error) {
        return res.status(400).json({ error: `Failed to fetch services individual entries: ${error.message}` });
    }

    res.json(data);
});

// Get a single services_individual entry
app.get('/services_individual/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('services_individual').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: `Failed to fetch services individual entry: ${error.message}` });
    }

    res.json(data);
});

// Update a services_individual entry (with image upload)
app.put('/services_individual/:id', upload.single('services_individual_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { services_individual_name, services_individual_title, services_individual_desc, services_individual_include, order } = req.body;

        let parsedInclude = [];
        try{
            parsedInclude = JSON.parse(services_individual_include);
        } catch (parseError) {
            return res.status(400).json({ error: 'Invalid services_individual_include format. Must be a JSON string.' });
        }

        let updateData = { services_individual_name, services_individual_title, services_individual_desc, services_individual_include: parsedInclude, order };

        if (req.file) {
            const filePath = `services_individual/${Date.now()}${path.extname(req.file.originalname)}`;
            const services_individual_img = await uploadServicesToSupabase(req.file, filePath);
            if (!services_individual_img) {
                return res.status(500).json({ error: 'Failed to upload services individual image.' });
            }
            updateData.services_individual_img = services_individual_img;
        }

        const { data, error } = await supabase
            .from('services_individual')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: `Failed to update services individual entry: ${error.message}` });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
});

// Delete a services_individual entry
app.delete('/services_individual/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('services_individual').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: `Failed to delete services individual entry: ${error.message}` });
    }

    res.json({ message: 'Services individual entry deleted', data });
});

// --------------------- SERVICES_SPECIAL CRUD ---------------------

// Create a services_special entry (with image upload)
app.post('/services_special', upload.single('services_special_img'), async (req, res) => {
    try {
        const { services_special_name, services_special_title, services_special_desc, services_special_include, order } = req.body;

        let parsedInclude = [];
        try{
            parsedInclude = JSON.parse(services_special_include);
        } catch (parseError) {
            return res.status(400).json({ error: 'Invalid services_special_include format. Must be a JSON string.' });
        }

        let services_special_img = null;
        if (req.file) {
            const filePath = `services_special/${Date.now()}${path.extname(req.file.originalname)}`;
            services_special_img = await uploadServicesToSupabase(req.file, filePath);
            if (!services_special_img) {
                return res.status(500).json({ error: 'Failed to upload services special image.' });
            }
        }

        const { data, error } = await supabase
            .from('services_special')
            .insert([{ services_special_name, services_special_title, services_special_desc, services_special_include: parsedInclude, services_special_img, order }])
            .select();

        if (error) {
            return res.status(400).json({ error: `Failed to create services special entry: ${error.message}` });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
});

// Get all services_special entries
app.get('/services_special', async (req, res) => {
    const { data, error } = await supabase.from('services_special').select('*').order('order', { ascending: true });

    if (error) {
        return res.status(400).json({ error: `Failed to fetch services special entries: ${error.message}` });
    }

    res.json(data);
});

// Get a single services_special entry
app.get('/services_special/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('services_special').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: `Failed to fetch services special entry: ${error.message}` });
    }

    res.json(data);
});

// Update a services_special entry (with image upload)
app.put('/services_special/:id', upload.single('services_special_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { services_special_name, services_special_title, services_special_desc, services_special_include, order } = req.body;

        let parsedInclude = [];
        try{
            parsedInclude = JSON.parse(services_special_include);
        } catch (parseError) {
            return res.status(400).json({ error: 'Invalid services_special_include format. Must be a JSON string.' });
        }

        let updateData = { services_special_name, services_special_title, services_special_desc, services_special_include: parsedInclude, order };

        if (req.file) {
            const filePath = `services_special/${Date.now()}${path.extname(req.file.originalname)}`;
            const services_special_img = await uploadServicesToSupabase(req.file, filePath);
            if (!services_special_img) {
                return res.status(500).json({ error: 'Failed to upload services special image.' });
            }
            updateData.services_special_img = services_special_img;
        }

        const { data, error } = await supabase
            .from('services_special')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: `Failed to update services special entry: ${error.message}` });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
});

// Delete a services_special entry
app.delete('/services_special/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('services_special').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: `Failed to delete services special entry: ${error.message}` });
    }

    res.json({ message: 'Services special entry deleted', data });
});

// --------------------- WORKS CRUD ---------------------

// Create a works entry (with image uploads)
app.post('/works', upload.fields([
    { name: 'work_main_img', maxCount: 1 },
    { name: 'work_logo_img', maxCount: 1 },
    { name: 'work_img', maxCount: 10 }
]), async (req, res) => {
    try {
        const { work_title, work_subtitle, work_desc, work_detail, work_people, work_category } = req.body;

        if (!VALID_WORK_CATEGORIES.includes(work_category)) {
            return res.status(400).json({ error: "Invalid work_category value" });
        }

        let work_main_img = null;
        let work_logo_img = null;
        let work_img = [];

        if (req.files['work_main_img']) {
            const mainImgFile = req.files['work_main_img'][0];
            const mainImgPath = `works/main/${Date.now()}${path.extname(mainImgFile.originalname)}`;
            work_main_img = await uploadWorksToSupabase(mainImgFile, mainImgPath);
        }

        if (req.files['work_logo_img']) {
            const logoImgFile = req.files['work_logo_img'][0];
            const logoImgPath = `works/logo/${Date.now()}${path.extname(logoImgFile.originalname)}`;
            work_logo_img = await uploadWorksToSupabase(logoImgFile, logoImgPath);
        }

        if (req.files['work_img']) {
            for (const file of req.files['work_img']) {
                const imgPath = `works/images/${Date.now()}${path.extname(file.originalname)}`;
                const imgUrl = await uploadWorksToSupabase(file, imgPath);
                if (imgUrl) work_img.push(imgUrl);
            }
        }

        const { data, error } = await supabase
            .from('works')
            .insert([{ work_title, work_subtitle, work_desc, work_detail, work_people, work_category, work_img, work_main_img, work_logo_img }])
            .select();

        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all works entries
app.get('/works', async (req, res) => {
    const { data, error } = await supabase.from('works').select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Get a single works entry
app.get('/works/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('works').select('*').eq('id', id).single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Update a works entry (with image uploads)
app.put('/works/:id', upload.fields([
    { name: 'work_main_img', maxCount: 1 },
    { name: 'work_logo_img', maxCount: 1 },
    { name: 'work_img', maxCount: 10 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const { work_title, work_subtitle, work_desc, work_detail, work_people, work_category } = req.body;

        if (!VALID_WORK_CATEGORIES.includes(work_category)) {
            return res.status(400).json({ error: "Invalid work_category value" });
        }

        let updateData = { work_title, work_subtitle, work_desc, work_detail, work_people, work_category };

        if (req.files['work_main_img']) {
            const mainImgFile = req.files['work_main_img'][0];
            const mainImgPath = `works/main/${Date.now()}${path.extname(mainImgFile.originalname)}`;
            updateData.work_main_img = await uploadWorksToSupabase(mainImgFile, mainImgPath);
        }

        if (req.files['work_logo_img']) {
            const logoImgFile = req.files['work_logo_img'][0];
            const logoImgPath = `works/logo/${Date.now()}${path.extname(logoImgFile.originalname)}`;
            updateData.work_logo_img = await uploadWorksToSupabase(logoImgFile, logoImgPath);
        }

        let work_img = [];
        if (req.files['work_img']) {
            for (const file of req.files['work_img']) {
                const imgPath = `works/images/${Date.now()}${path.extname(file.originalname)}`;
                const imgUrl = await uploadWorksToSupabase(file, imgPath);
                if (imgUrl) work_img.push(imgUrl);
            }
        }
        if (work_img.length > 0) updateData.work_img = work_img;

        const { data, error } = await supabase.from('works').update(updateData).eq('id', id).select();
        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a works entry
app.delete('/works/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('works').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Work deleted successfully' });
});

// --------------------- WORK PAGE CRUD ---------------------

// Create a work_page entry (with image upload)
app.post('/work_page', upload.single('work_page_img'), async (req, res) => {
    try {
        const { work_page_title, work_page_subtitle } = req.body;

        let work_page_img = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            work_page_img = await uploadFileToSupabase(req.file, filePath);
            if (!work_page_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('work_page')
            .insert([{ work_page_img, work_page_title, work_page_subtitle }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all work_page entries
app.get('/work_page', async (req, res) => {
    const { data, error } = await supabase.from('work_page').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single work_page entry
app.get('/work_page/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('work_page').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a work_page entry (with image upload)
app.put('/work_page/:id', upload.single('work_page_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { work_page_title, work_page_subtitle } = req.body;

        let updateData = { work_page_title, work_page_subtitle };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const work_page_img = await uploadFileToSupabase(req.file, filePath);
            if (!work_page_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.work_page_img = work_page_img;
        }

        const { data, error } = await supabase
            .from('work_page')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a work_page entry
app.delete('/work_page/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('work_page').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Work page entry deleted', data });
});

// --------------------- BLOGS CRUD ---------------------

// Create a blog entry (with image uploads)
app.post('/blogs', upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'image_list', maxCount: 10 }
]), async (req, res) => {
    try {
        const { title, slug, content, excerpt, author_name, author_contact, published_at, is_published, is_pinned } = req.body;

        let cover_image = null;
        let image_list = [];

        if (req.files['cover_image']) {
            const coverImgFile = req.files['cover_image'][0];
            const coverImgPath = `cover/${Date.now()}${path.extname(coverImgFile.originalname)}`;
            cover_image = await uploadBlogsToSupabase(coverImgFile, coverImgPath);
        }

        if (req.files['image_list']) {
            for (const file of req.files['image_list']) {
                const imgPath = `images/${Date.now()}${path.extname(file.originalname)}`;
                const imgUrl = await uploadBlogsToSupabase(file, imgPath);
                if (imgUrl) image_list.push(imgUrl);
            }
        }

        const { data, error } = await supabase
            .from('blogs')
            .insert([{ title, slug, content, excerpt, cover_image, image_list, author_name, author_contact, published_at, is_published, is_pinned }])
            .select();

        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all blog entries
app.get('/blogs', async (req, res) => {
    const { data, error } = await supabase.from('blogs').select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Get a single blog entry
app.get('/blogs/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Update a blog entry (with image uploads)
app.put('/blogs/:id', upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'image_list', maxCount: 10 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, content, excerpt, author_name, author_contact, published_at, is_published, is_pinned } = req.body;

        let updateData = { title, slug, content, excerpt, author_name, author_contact, published_at, is_published, is_pinned };

        if (req.files['cover_image']) {
            const coverImgFile = req.files['cover_image'][0];
            const coverImgPath = `cover/${Date.now()}${path.extname(coverImgFile.originalname)}`;
            updateData.cover_image = await uploadBlogsToSupabase(coverImgFile, coverImgPath);
        }

        let image_list = [];
        if (req.files['image_list']) {
            for (const file of req.files['image_list']) {
                const imgPath = `images/${Date.now()}${path.extname(file.originalname)}`;
                const imgUrl = await uploadBlogsToSupabase(file, imgPath);
                if (imgUrl) image_list.push(imgUrl);
            }
        }
        if (image_list.length > 0) updateData.image_list = image_list;

        const { data, error } = await supabase.from('blogs').update(updateData).eq('id', id).select();
        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a blog entry
app.delete('/blogs/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Blog deleted successfully' });
});

// --------------------- CONTACT CRUD ---------------------

// Create a contact (with image upload)
app.post('/contacts', upload.single('contact_image'), async (req, res) => {
    try {
        const { contact_title, contact_subtitle } = req.body;

        let contact_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            contact_image = await uploadFileToSupabase(req.file, filePath);
            if (!contact_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('contact')
            .insert([{ contact_image, contact_title, contact_subtitle }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all contacts
app.get('/contacts', async (req, res) => {
    const { data, error } = await supabase.from('contact').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single contact
app.get('/contacts/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('contact').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a contact (with image upload)
app.put('/contacts/:id', upload.single('contact_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { contact_title, contact_subtitle } = req.body;

        let updateData = { contact_title, contact_subtitle };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const contact_image = await uploadFileToSupabase(req.file, filePath);
            if (!contact_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.contact_image = contact_image;
        }

        const { data, error } = await supabase
            .from('contact')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a contact
app.delete('/contacts/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('contact').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Contact deleted', data });
});

// --------------------- ABOUT CRUD ---------------------

// Create an about (with image upload)
app.post('/abouts', upload.single('about_img'), async (req, res) => {
    try {
        const { about_title, about_subtitle } = req.body;

        let about_img = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            about_img = await uploadFileToSupabase(req.file, filePath);
            if (!about_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('about')
            .insert([{ about_img, about_title, about_subtitle }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all abouts
app.get('/abouts', async (req, res) => {
    const { data, error } = await supabase.from('about').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single about
app.get('/abouts/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('about').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update an about (with image upload)
app.put('/abouts/:id', upload.single('about_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { about_title, about_subtitle } = req.body;

        let updateData = { about_title, about_subtitle };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const about_img = await uploadFileToSupabase(req.file, filePath);
            if (!about_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.about_img = about_img;
        }

        const { data, error } = await supabase
            .from('about')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an about
app.delete('/abouts/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('about').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'About deleted', data });
});

// --------------------- VISION CRUD ---------------------

// Create a vision
app.post('/visions', async (req, res) => {
    try {
        const { vision_content } = req.body;
        const { data, error } = await supabase.from('vision').insert([{ vision_content }]).select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all visions
app.get('/visions', async (req, res) => {
    const { data, error } = await supabase.from('vision').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single vision
app.get('/visions/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('vision').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a vision
app.put('/visions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { vision_content } = req.body;
        const { data, error } = await supabase.from('vision').update({ vision_content }).eq('id', id).select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a vision
app.delete('/visions/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('vision').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Vision deleted', data });
});

// --------------------- MISSION CRUD ---------------------

// Create a mission
app.post('/missions', async (req, res) => {
    try {
        const { mission_content } = req.body;
        const { data, error } = await supabase.from('mission').insert([{ mission_content }]).select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all missions
app.get('/missions', async (req, res) => {
    const { data, error } = await supabase.from('mission').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single mission
app.get('/missions/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('mission').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a mission
app.put('/missions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mission_content } = req.body;
        const { data, error } = await supabase.from('mission').update({ mission_content }).eq('id', id).select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a mission
app.delete('/missions/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('mission').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Mission deleted', data });
});

// --------------------- WHY CRUD ---------------------

// Create a why
app.post('/whys', async (req, res) => {
    try {
        const { why_content } = req.body;
        const { data, error } = await supabase.from('why').insert([{ why_content }]).select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all whys
app.get('/whys', async (req, res) => {
    const { data, error } = await supabase.from('why').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single why
app.get('/whys/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('why').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a why
app.put('/whys/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { why_content } = req.body;
        const { data, error } = await supabase.from('why').update({ why_content }).eq('id', id).select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a why
app.delete('/whys/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('why').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Why deleted', data });
});

// --------------------- PEOPLE CRUD ---------------------

// Create a people (with image upload)
app.post('/peoples', upload.single('people_img'), async (req, res) => {
    try {
        const { people_name, people_role } = req.body;

        let people_img = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            people_img = await uploadFileToSupabase(req.file, filePath);
            if (!people_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('people')
            .insert([{ people_img, people_name, people_role }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all peoples
app.get('/peoples', async (req, res) => {
    const { data, error } = await supabase.from('people').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single people
app.get('/peoples/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('people').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a people (with image upload)
app.put('/peoples/:id', upload.single('people_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { people_name, people_role } = req.body;

        let updateData = { people_name, people_role };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const people_img = await uploadFileToSupabase(req.file, filePath);
            if (!people_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.people_img = people_img;
        }

        const { data, error } = await supabase
            .from('people')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a people
app.delete('/peoples/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('people').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'People deleted', data });
});

// --------------------- START SERVER ---------------------

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});