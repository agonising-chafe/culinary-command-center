const router = require('express').Router();
const OpenAI = require('openai');

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The main generation endpoint
// Route: POST /api/mealplan/generate
router.post('/generate', async (req, res) => {
  try {
    const { prompt, expiring = [], taste = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required.' });
    }

    // This is the detailed instruction we send to the AI.
    // We ask it to act as a chef and return the data in a specific JSON format.
    const fullPrompt = `
      You are a culinary assistant. Based on the user's request, generate a list of recipes.
      The user's request is: "${prompt}".

      Please return the response as a single, valid JSON object with a key "recipes".
      The value of "recipes" must be an array of recipe objects. Do not include any text or markdown formatting before or after the JSON object.
      Each recipe object must have the following keys: "title", "cookTime", "calories", "ingredients", and "instructions".
      "ingredients" should be an array of strings.
      "instructions" should be an array of strings.
    `;
    
    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106", // Using a model that's good with JSON
      messages: [{ role: "user", content: fullPrompt }],
      response_format: { type: "json_object" }, // Enforce JSON output
    });

    console.log('OpenAI completion:', completion); // Debug log

    const content = completion.choices[0].message.content;

    // The AI's response is a string, so we need to parse it into a JSON object
    let parsedJson;
    try {
      parsedJson = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return res.status(500).json({ message: 'Failed to parse AI response' });
    }

    // Send the array of recipes back to the front-end
    res.json(parsedJson.recipes);

  } catch (error) {
    console.error('Error generating meal plan with OpenAI:', error);
    res.status(500).json({ message: 'Failed to generate meal plan.' });
  }
});

router.post('/generate-one', async (req, res) => {
  const { prompt, expiring = [], taste = {} } = req.body;
  // Stub implementation: replace with actual AI integration
  const sampleRecipe = {
    id: Date.now(),
    title: `Generated for: ${prompt}`,
    cookTime: '30m',
    calories: '500 kcal',
    category: 'General',
    ingredients: [],
    instructions: [],
    image: ''
  };
  res.json({ recipe: sampleRecipe });
});

module.exports = router;
