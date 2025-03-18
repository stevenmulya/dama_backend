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
const upload = multer({ storage: multer.memoryStorage() });

// Fungsi untuk mengunggah MyPortofolio ke Supabase Storage
async function uploadHomeToSupabase(file, filePath) {
    try {
        const { error, data } = await storage
            .from('homebucket')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) {
            console.error('Supabase Storage Error:', error);
            return null;
        }

        return `${supabaseUrl}/storage/v1/object/public/homebucket/${filePath}`;
    } catch (error) {
        console.error("Error uploading to Supabase Storage:", error);
        return null;
    }
}

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

// Fungsi untuk mengunggah MyBlog ke Supabase Storage
async function uploadWorksToSupabase(file, filePath) {
    try {
        const { error, data } = await storage
            .from('worksbucket')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) {
            console.error('Supabase Storage Error:', error);
            return null;
        }

        return `${supabaseUrl}/storage/v1/object/public/worksbucket/${filePath}`;
    } catch (error) {
        console.error("Error uploading to Supabase Storage:", error);
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

// --------------------- TAGLINES CRUD ---------------------

// Create a tagline (with image upload)
app.post('/taglines', upload.single('tagline_img'), async (req, res) => {
    try {
        const { tagline_text, tagline_sub_text } = req.body;

        let tagline_img = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            tagline_img = await uploadHomeToSupabase(req.file, filePath);
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
            const tagline_img = await uploadHomeToSupabase(req.file, filePath);
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

// --------------------- OURCLIENTS CRUD ---------------------

// Create an ourclient (with image upload)
app.post('/ourclients', upload.single('client_logo_img'), async (req, res) => {
    try {
        const { client_name, client_link } = req.body;

        let client_logo_img = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            client_logo_img = await uploadHomeToSupabase(req.file, filePath);
            if (!client_logo_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
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

// Get all ourclients
app.get('/ourclients', async (req, res) => {
    const { data, error } = await supabase.from('ourclients').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single ourclient
app.get('/ourclients/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('ourclients').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update an ourclient (with image upload)
app.put('/ourclients/:id', upload.single('client_logo_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { client_name, client_link } = req.body;

        let updateData = { client_name, client_link };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const client_logo_img = await uploadHomeToSupabase(req.file, filePath);
            if (!client_logo_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
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

// Delete an ourclient
app.delete('/ourclients/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('ourclients').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Ourclient deleted', data });
});

// --------------------- TESTIMONIALS CRUD ---------------------

// Create a testimonial (with image upload)
app.post('/testimonials', upload.single('testimonial_img'), async (req, res) => {
    try {
        const { testimonial_from, testimonial_text } = req.body;

        let testimonial_img = null;
        if (req.file) {
            const filePath = `<span class="math-inline">\{Date\.now\(\)\}</span>{path.extname(req.file.originalname)}`;
            testimonial_img = await uploadHomeToSupabase(req.file, filePath);
            if (!testimonial_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('testimonials')
            .insert([{ testimonial_img, testimonial_from, testimonial_text }])
            .select();if (error) {
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
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const testimonial_img = await uploadHomeToSupabase(req.file, filePath);
            if (!testimonial_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
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

// Create a connect (with image upload)
app.post('/connect', upload.single('connect_img'), async (req, res) => {
    try {
        const { connect_text } = req.body;

        let connect_img = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            connect_img = await uploadHomeToSupabase(req.file, filePath);
            if (!connect_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('connect')
            .insert([{ connect_img, connect_text }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all connects
app.get('/connect', async (req, res) => {
    const { data, error } = await supabase.from('connect').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single connect
app.get('/connect/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('connect').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a connect (with image upload)
app.put('/connect/:id', upload.single('connect_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { connect_text } = req.body;

        let updateData = { connect_text };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const connect_img = await uploadHomeToSupabase(req.file, filePath);
            if (!connect_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
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

// Delete a connect
app.delete('/connect/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('connect').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Connect deleted', data });
});

// --------------------- INSTAGRAMS CRUD ---------------------

// Create an instagram (with image upload)
app.post('/instagrams', upload.single('instagram_img'), async (req, res) => {
    try {
        const { instagram_name, instagram_link } = req.body;

        let instagram_img = null;
        if (req.file) {
            const filePath = `<span class="math-inline">\{Date\.now\(\)\}</span>{path.extname(req.file.originalname)}`;
            instagram_img = await uploadHomeToSupabase(req.file, filePath);
            if (!instagram_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
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

// Get all instagrams
app.get('/instagrams', async (req, res) => {
    const { data, error } = await supabase.from('instagrams').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single instagram
app.get('/instagrams/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('instagrams').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update an instagram (with image upload)
app.put('/instagrams/:id', upload.single('instagram_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { instagram_instagram_name, instagram_link } = req.body;

        let updateData = { instagram_name, instagram_link };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const instagram_img = await uploadHomeToSupabase(req.file, filePath);
            if (!instagram_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
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

// Delete an instagram
app.delete('/instagrams/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('instagrams').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Instagram deleted', data });
});

// --------------------- DAMA CRUD ---------------------

// Create a dama (with image upload)
app.post('/dama', upload.single('dama_logo'), async (req, res) => {
    try {
        const { dama_whatsapp, dama_instagram, dama_linkedin, dama_tiktok, dama_cv } = req.body;

        let dama_logo = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            dama_logo = await uploadHomeToSupabase(req.file, filePath);
            if (!dama_logo) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('dama')
            .insert([{ dama_logo, dama_whatsapp, dama_instagram, dama_linkedin, dama_tiktok, dama_cv }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all damas
app.get('/dama', async (req, res) => {
    const { data, error } = await supabase.from('dama').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single dama
app.get('/dama/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('dama').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a dama (with image upload)
app.put('/dama/:id', upload.single('dama_logo'), async (req, res) => {
    try {
        const { id } = req.params;
        const { dama_whatsapp, dama_instagram, dama_linkedin, dama_tiktok, dama_cv } = req.body;

        let updateData = { dama_whatsapp, dama_instagram, dama_linkedin, dama_tiktok, dama_cv };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const dama_logo = await uploadHomeToSupabase(req.file, filePath);
            if (!dama_logo) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.dama_logo = dama_logo;
        }

        const { data, error } = await supabase
            .from('dama')
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

// Delete a dama
app.delete('/dama/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('dama').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Dama deleted', data });
});

// --------------------- TOSERVICES CRUD ---------------------

// Create a toservices
app.post('/toservices', upload.single('toservices_img'), async (req, res) => {
    try {
        const { toservices_text } = req.body;

        let toservices_img = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            toservices_img = await uploadHomeToSupabase(req.file, filePath); // Use servicesbucket
            if (!toservices_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('toservices') // Menggunakan tabel 'toservices'
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
    const { data, error } = await supabase.from('toservices').select('*'); // Menggunakan tabel 'toservices'

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single toservices
app.get('/toservices/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('toservices').select('*').eq('id', id).single(); // Menggunakan tabel 'toservices'

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a toservices (with image upload)
app.put('/toservices/:id', upload.single('toservices_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { toservices_text } = req.body;

        let updateData = { toservices_text };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const toservices_img = await uploadServicesToSupabase(req.file, filePath); // Use servicesbucket
            if (!toservices_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.toservices_img = toservices_img;
        }

        const { data, error } = await supabase
            .from('toservices') // Menggunakan tabel 'toservices'
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

// Delete a toservices
app.delete('/toservices/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('toservices').delete().eq('id', id); // Menggunakan tabel 'toservices'

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'TOServices deleted', data });
});

// --------------------- TOWORKS CRUD ---------------------

// Create a toworks
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

// Get a single toworks
app.get('/toworks/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('toworks').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a toworks
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

// Delete a toworks
app.delete('/toworks/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('toworks').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'TOWorks deleted', data });
});

// --------------------- SERVICES_INDIVIDUAL CRUD ---------------------

// Create a services_individual
app.post('/services_individual', upload.single('services_individual_img'), async (req, res) => {
    try {
        const {
            services_individual_name,
            services_individual_title,
            services_individual_desc,
            include_1,
            include_2,
            include_3,
        } = req.body;

        let services_individual_img = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            services_individual_img = await uploadServicesToSupabase(req.file, filePath); // Use servicesbucket
            if (!services_individual_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const includes = [include_1, include_2, include_3].filter(Boolean); // Filter out empty includes

        const { data, error } = await supabase
            .from('services_individual')
            .insert([{
                services_individual_img,
                services_individual_name,
                services_individual_title,
                services_individual_desc,
                services_individual_include: includes,
            }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all services_individual
app.get('/services_individual', async (req, res) => {
    const { data, error } = await supabase.from('services_individual').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single services_individual
app.get('/services_individual/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('services_individual').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a services_individual (with image upload)
app.put('/services_individual/:id', upload.single('services_individual_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            services_individual_name,
            services_individual_title,
            services_individual_desc,
            include_1,
            include_2,
            include_3,
        } = req.body;

        let updateData = {
            services_individual_name,
            services_individual_title,
            services_individual_desc,
        };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const services_individual_img = await uploadServicesToSupabase(req.file, filePath); // Use servicesbucket
            if (!services_individual_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.services_individual_img = services_individual_img;
        }

        const includes = [include_1, include_2, include_3].filter(Boolean); // Filter out empty includes
        updateData.services_individual_include = includes;

        const { data, error } = await supabase
            .from('services_individual')
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

// Delete a services_individual
app.delete('/services_individual/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('services_individual').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Services_individual deleted', data });
});

// --------------------- SERVICES_SPECIAL CRUD ---------------------

// Create a services_special
app.post('/services_special', upload.single('services_special_img'), async (req, res) => {
    try {
        const {
            services_special_name,
            services_special_title,
            services_special_desc,
            include_1,
            include_2,
            include_3,
        } = req.body;

        let services_special_img = null;
        if (req.file) {
            const filePath = `<span class="math-inline">\{Date\.now\(\)\}</span>{path.extname(req.file.originalname)}`;
            services_special_img = await uploadServicesToSupabase(req.file, filePath); // Use servicesbucket
            if (!services_special_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const includes = [include_1, include_2, include_3].filter(Boolean); // Filter out empty includes

        const { data, error } = await supabase
            .from('services_special')
            .insert([{
                services_special_img,
                services_special_name,
                services_special_title,
                services_special_desc,
                services_special_include: includes,
            }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all services_special
app.get('/services_special', async (req, res) => {
    const { data, error } = await supabase.from('services_special').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single services_special
app.get('/services_special/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('services_special').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a services_special (with image upload)
app.put('/services_special/:id', upload.single('services_special_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            services_special_name,
            services_special_title,
            services_special_desc,
            include_1,
            include_2,
            include_3,
        } = req.body;

        let updateData = {
            services_special_name,
            services_special_title,
            services_special_desc,
        };

        if (req.file) {
            const filePath = `<span class="math-inline">\{Date\.now\(\)\}</span>{path.extname(req.file.originalname)}`;
            const services_special_img = await uploadServicesToSupabase(req.file, filePath); // Use servicesbucket
            if (!services_special_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.services_special_img = services_special_img;
        }

        const includes = [include_1, include_2, include_3].filter(Boolean); // Filter out empty includes
        updateData.services_special_include = includes;

        const { data, error } = await supabase
            .from('services_special')
            .update(updateData).eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a services_special
app.delete('/services_special/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('services_special').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Services_special deleted', data });
});

// --------------------- WORKS CRUD ---------------------

// Create a work
app.post('/works', upload.array('work_img', 10), async (req, res) => {
    try {
        const {
            work_title,
            work_subtitle,
            work_desc,
            work_detail,
            work_people,
            work_category,
        } = req.body;

        let work_img = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const filePath = `${Date.now()}-${file.originalname}`;
                const imageUrl = await uploadWorksToSupabase(file, filePath); // Use worksbucket
                if (imageUrl) {
                    work_img.push(imageUrl);
                } else {
                    return res.status(500).json({ error: 'Failed to upload one or more images' });
                }
            }
        }

        const { data, error } = await supabase
            .from('works')
            .insert([{
                work_title,
                work_subtitle,
                work_desc,
                work_detail,
                work_people,
                work_category,
                work_img,
            }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all works
app.get('/works', async (req, res) => {
    const { data, error } = await supabase.from('works').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single work
app.get('/works/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('works').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a work (with image upload)
app.put('/works/:id', upload.array('work_img', 10), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            work_title,
            work_subtitle,
            work_desc,
            work_detail,
            work_people,
            work_category,
        } = req.body;

        let updateData = {
            work_title,
            work_subtitle,
            work_desc,
            work_detail,
            work_people,
            work_category,
        };

        if (req.files && req.files.length > 0) {
            let work_img = [];
            for (const file of req.files) {
                const filePath = `${Date.now()}-${file.originalname}`;
                const imageUrl = await uploadWorksToSupabase(file, filePath); // Use worksbucket
                if (imageUrl) {
                    work_img.push(imageUrl);
                } else {
                    return res.status(500).json({ error: 'Failed to upload one or more images' });
                }
            }
            updateData.work_img = work_img;
        }

        const { data, error } = await supabase
            .from('works')
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

// Delete a work
app.delete('/works/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('works').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Work deleted', data });
});

// --------------------- BLOGS CRUD ---------------------

// Create a blog (with image upload)
app.post('/blogs', upload.single('blog_img'), async (req, res) => {
    try {
        const { blog_title, blog_desc, blog_author, blog_date, blog_content } = req.body;

        let blog_img = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            blog_img = await uploadBlogsToSupabase(req.file, filePath);
            if (!blog_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('blogs')
            .insert([{
                blog_title,
                blog_desc,
                blog_img,
                blog_author,
                blog_date,
                blog_content,
            }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all blogs
app.get('/blogs', async (req, res) => {
    try {
        const { data, error } = await supabase.from('blogs').select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single blog
app.get('/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a blog (with image upload)
app.put('/blogs/:id', upload.single('blog_img'), async (req, res) => {
    try {
        const { id } = req.params;
        const { blog_title, blog_desc, blog_author, blog_date, blog_content } = req.body;

        let updateData = {
            blog_title,
            blog_desc,
            blog_author,
            blog_date,
            blog_content,
        };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const blog_img = await uploadBlogsToSupabase(req.file, filePath);
            if (!blog_img) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.blog_img = blog_img;
        }

        const { data, error } = await supabase
            .from('blogs')
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

// Delete a blog
app.delete('/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Blog deleted', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------- START SERVER ---------------------

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});