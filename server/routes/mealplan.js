const router = require('express').Router();
const MOCK = String(process.env.MOCK_MODE).toLowerCase() === 'true';
let OpenAI = null;
let openai = null;
try {
  OpenAI = require('openai');
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch {
  // openai package not installed; route will return 501 if called
}

function sampleRecipes(prompt = 'Tasty meal', count = 3) {
  const items = [];
  for (let i = 0; i < count; i += 1) {
    items.push({
      id: Date.now() + i,
      title: `${prompt} #${i + 1}`,
      cookTime: ['20m', '30m', '45m'][i % 3],
      calories: `${450 + i * 50} kcal`,
      category: ['Quick', 'Balanced', 'Comfort'][i % 3],
      ingredients: ['1 onion', '2 eggs', '1 tbsp olive oil'],
      instructions: [
        'Prep ingredients',
        'Cook in pan until done',
        'Serve warm',
      ],
      image: '',
    });
  }
  return items;
}

// The main generation endpoint
// Route: POST /api/mealplan/generate
router.post('/generate', async (req, res) => {
  try {
    if (MOCK) {
      const { prompt = 'Chef choice' } = req.body || {};
      return res.json(sampleRecipes(prompt, 6));
    }
    if (!openai) {
      return res.status(501).json({ message: 'AI generation not configured on server.' });
    }
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
  const { prompt = 'Chef choice' } = req.body || {};
  if (MOCK) {
    const [one] = sampleRecipes(prompt, 1);
    return res.json({ recipe: one });
  }
  // Without mock or OpenAI, return a predictable stub
  const sampleRecipe = sampleRecipes(prompt, 1)[0];
  return res.json({ recipe: sampleRecipe });
});

module.exports = router;
