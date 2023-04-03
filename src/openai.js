import OpenAI from 'openai';

const openai = new OpenAI(process.env.REACT_APP_OPENAI_API_KEY);

export const getGptResponse = async (prompt) => {
  try {
    const response = await openai.Completions.create({
      engine: 'text-davinci-002',
      prompt: prompt,
      max_tokens: 50,
      n: 1,
      stop: null,
      temperature: 0.5,
    });

    return response.choices[0].text.trim();
  } catch (error) {
    console.error('Failed to get GPT response:', error);
    return null;
  }
};
