/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import {
  OpenAIApi,
  Configuration,
  ChatCompletionResponseMessage,
} from 'openai';
import { BoardQuestionInput, OpenAiOptions } from './entities/openai.entity';

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
      const prompt = `
      Olá, ChatGPT! Eu tenho um array de flashcards para um quiz, e cada flashcard contém os seguintes campos: question, answer, practiceExample e category. Gostaria que você criasse um quiz com base nesses flashcards. Para cada flashcard, por favor, gere diferentes tipos de perguntas de quiz, como múltipla escolha, verdadeiro ou falso, e outras que você considerar apropriadas. Assegure-se de que cada pergunta do quiz inclua opções de resposta e indique qual é a resposta correta. Utilize também o practiceExample e a category para adicionar contexto ou detalhes às perguntas, se aplicável. Aqui está o array de flashcards:

      ${text.cards}


Notas para Uso:

Utilize o array fornecido de flashcards para criar perguntas variadas de quiz. Inclua diferentes tipos de perguntas, como múltipla escolha, verdadeiro ou falso, ou outras apropriadas.
Forneça opções de resposta para cada pergunta, garantindo que uma delas seja a resposta correta.
Utilize os campos practiceExample e category para adicionar contexto ou detalhes às perguntas, quando aplicável.
Apresente as perguntas, opções de resposta e indique claramente qual é a resposta correta.
Retorne o resultado em formato JSON.

      `;
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
