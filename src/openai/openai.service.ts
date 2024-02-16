/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import {
  ChatCompletionResponseMessage,
  Configuration,
  OpenAIApi,
} from 'openai';
import { OpenAiOptions } from './entities/openai.entity';

import { CreateDeckInput } from 'src/deck/entities/deck.entity';
import { CreateQuizInput } from 'src/quiz/entities/Quiz.entity';

@Injectable()
export class OpenAiService {
  private openAiApi: OpenAIApi;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async connect(config: OpenAiOptions) {
    return (this.openAiApi = new OpenAIApi(new Configuration(config)));
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  createPrompt(text: CreateDeckInput | CreateQuizInput) {
    // if ('question' in input && 'boardId' in input)
    if ('theme' in text) {
      const prompt = `
      
      Preciso criar um objeto JSON para um deck de flashcards personalizados e gostaria de sua ajuda para desenvolvê-los de forma específica e detalhada. Aqui estão as informações e preferências que tenho em mente:

Estrutura do Objeto Deck:

Crie o deck de flashcards em um objeto JSON com a seguinte estrutura, segue o exemplo:

{
  "deck": {
    "id": "ID único do deck",
    
    "theme": "Tema do deck",
    "difficulty": "Nível de dificuldade (Iniciante, Intermediário, Avançado)",
    "cards": [
      {
        "id": "ID único do card (number)",
        "question": "Texto da pergunta do flashcard",
        "answer": "Texto da resposta do flashcard",
        "practiceExample": "Descrição de exemplos práticos ou estudos de caso, se aplicável",
        "category": "Categoria relacionada ao flashcard"
      }
      
    ]
  }
}
Além de seguir esse exemplo você precisa incluir os seguintes detalhes:


Tema dos Flashcards: ${text.theme}
Nível de Conhecimento Atual:  ${text.knowledgeLevel}
Objetivo de Aprendizado:  ${text.goal}
Estilo de Pergunta Preferido:  ${text.typeOfQuestion}
Tópicos Específicos a serem Abordados:  ${text.topicsToBeIncluded}
Limitações ou Restrições:  ${text.limitations}
Quantidade de flashcards desejados: ${text.numberOfCards}
Utilize as informações fornecidas para gerar um conjunto de flashcards no formato JSON especificado, com um ID único para cada card dentro do deck.Lembre-se de garantir que haverá a quantidade solicitada de flashcards dentro de cards. Seguindo todas as informações, me retorne apenas o objeto JSON,Obrigado!


      `;

      return prompt;
    } else if ('deckAssociatedId' in text) {
      const serializedCards = JSON.stringify(text.cards);
      const prompt = `
Olá, ChatGPT! Eu estou criando um quiz interativo e preciso da sua ajuda para gerar perguntas dinâmicas e envolventes com base em um array específico de flashcards. Cada flashcard contém os seguintes campos: question (a pergunta original), answer (a resposta correta), practiceExample (um exemplo prático relacionado à pergunta), e category (a categoria da pergunta). 

Para cada flashcard, gere perguntas de quiz que sejam diretamente relacionadas ao conteúdo do flashcard, utilizando informações dos campos fornecidos de forma criativa. Por exemplo, transforme a "question" original em uma pergunta de múltipla escolha, crie uma pergunta de verdadeiro ou falso baseada no "practiceExample", ou use a "category" para formular uma pergunta contextual.

Aqui estão os detalhes para a estruturação das perguntas do quiz:

- Cada pergunta deve ter um ID único.
- As perguntas devem refletir diretamente o conteúdo dos flashcards, promovendo um quiz interativo e informativo.
- Inclua um array de opções de resposta, assegurando que uma delas seja a resposta correta, diretamente derivada do campo "answer" do flashcard.
- Se aplicável, incorpore o "practiceExample" e a "category" para enriquecer a pergunta e fornecer contexto adicional.

Segue o array de flashcards para a base das perguntas: [${serializedCards}]
Com base no array de flashcards fornecido, por favor, crie perguntas de quiz interativas, substituindo os placeholders pelos valores reais dos flashcards. Para cada flashcard, gere uma pergunta que utilize diretamente sua pergunta, resposta, exemplo prático e categoria, conforme aplicável. Aqui está um exemplo de como os dados dos flashcards devem ser aplicados nas perguntas do quiz:



Estruture a resposta em JSON da seguinte forma:

{
  "questions": [
    {
      "id": "ID da questão",
      "question": "Texto da questão",
      "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
      "answer": "Opção correta"
    }
    // Repita para cada flashcard fornecido
  ],
}
Por favor, mantenha a resposta focada e direta, utilizando apenas as informações dos flashcards para criar as perguntas do quiz. O objetivo é maximizar a interatividade e relevância do conteúdo dos flashcards no quiz. Me retorne apenas o resultado em formato JSON.`;
      return prompt;
    }
  }
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async getGptAnswer(
    question: CreateDeckInput | CreateQuizInput,
  ): Promise<ChatCompletionResponseMessage> {
    try {
      console.log('OPENAI SERVICE', question);
      const prompt = this.createPrompt(question);
      console.log('formated', prompt);
      const completion = await this.openAiApi.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: this.createPrompt(question) }],
      });

      const gptAnswer = completion.data.choices[0].message;

      return gptAnswer;
    } catch (error) {
      throw new Error(error);
    }
  }
}
