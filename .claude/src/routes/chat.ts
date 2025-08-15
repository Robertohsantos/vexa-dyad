import express from 'express';
import { guardPublicText } from '../middleware/redactor';

const router = express.Router();

async function generateWithLLM(userMsg: string): Promise<string> {
  // placeholder — implemente chamada ao gateway aqui
  return `Rascunho de resposta para: ${userMsg}`;
}
async function regenerateWithLLM(original: string, instruction: string): Promise<string> {
  // placeholder — implemente reescrita no gateway aqui
  return original.replace(/BMAD/gi, 'fluxo proprietário');
}

router.post('/respond', async (req, res) => {
  const userMsg = req.body?.message || '';
  const draft = await generateWithLLM(userMsg);
  const guarded = await guardPublicText(draft, regenerateWithLLM, { hardBlock: false });

  res.json({ message: guarded.text, meta: { redacted: guarded.redacted, retries: guarded.retries } });
});

export default router;
