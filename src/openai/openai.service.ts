/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { OpenAIApi, Configuration } from 'openai';
import { BoardQuestionInput, OpenAiOptions } from './entities/openai.entity';

import { CreateTaskInput } from 'src/board/entities/board.entity';

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
  formatCompletion(completion) {
    let cardsArray;
    try {
      cardsArray = JSON.parse(completion.content);
    } catch (error) {
      throw new Error('Erro ao avaliar o código JavaScript.');
    }

    return cardsArray;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  createPrompt(
    text: BoardQuestionInput | CreateTaskInput,
    numberOfTasks?: number,
  ) {
    // if ('question' in input && 'boardId' in input)
    if ('acceptanceCriteria' in text) {
      const prompt = `
    Como Product Owner de uma empresa renomada, sua experiência é fundamental para ajudar Roger a desestruturar uma tarefa do projeto dele baseado na metodologia SCRUM. Roger está com a tarefa: "${
      text.title
    }"  e ele precisa criar dividir ela em subtarefas .

Com base na breve descrição de Roger sobre a tarefa: "${
        text.description
      }", você pode detalhar as subtarefas necessárias para que Roger alcance seus objetivos, lembre-se de detalhar o máximo possível as tarefas. Essas tarefas serão transformadas em cards que serão utilizados na metodologia SCRUM, sendo todos eles iniciados no backlog.
Roger, gostaria de receber uma estrutura de saída similar a essas tasks, o numero de tasks atuais são: ${numberOfTasks} você deverá criar o id das subtasks a partir do numero de tasks passado:
    {
      "id": < aqui você utilizará essa informação ${
        text.id
      } mas adequará ao numero de tasks que é igual a ${numberOfTasks} (exemplo IN-${
        numberOfTasks + 1
      }) >,
      "title": "Aprender sobre Callbacks",
      "description": "Estudar callbacks, uma técnica fundamental para trabalhar com funções assíncronas em JavaScript. Recomenda-se o vídeo 'JavaScript Callbacks Explained!' disponível em: https://www.youtube.com/watch?v=QRq2zMHlBz4",
      "storyPoints": 1,
      "acceptanceCriteria": "Entender como utilizar callbacks para realizar operações assíncronas",
      "dueDate": "03/08/2023",
      "label": "backlog",
      "parentTask": ${text.id}
    },
    {
      "id": < aqui você utilizará essa informação ${
        text.id
      } mas adequará ao numero de tasks que é igual a ${numberOfTasks}(exemplo IN-${
        numberOfTasks + 2
      }) >,
      "title": "Aprender sobre Async/Await",
      "description": "Estudar a sintaxe e a utilização do recurso Async/Await do JavaScript permitindo escrever código assíncrono de forma síncrona. Para auxiliar, sugere-se ler a documentação oficial disponível em: https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/Asynchronous/Async_await",
      "storyPoints": 3,
      "acceptanceCriteria": "Ser capaz de utilizar o Async/Await para simplificar a escrita de código assíncrono",
      "dueDate": "03/08/2023",
      "label": "backlog",
      "parentTask":  ${text.id}
    }
    
    A resposta que você irá retornar será em um bloco de  array que contém os cards gerados, lembre-se que array retornado deve estar na linguagem javascript, abaixo segue um exemplo de como essa resposta poderia ser, lembre-se de adicionar o parentTask de cada task, siga ela estritamente retornando apenas o [cards gerados]: 
    [
      {
        "id":  JS-2,
        "title": "Aprender sobre Promises",
        "description": "Estudar o conceito de Promises no JavaScript. Pode-se utilizar o artigo 'Understanding Promises in JavaScript' como referência: https://scotch.io/tutorials/javascript-promises-for-dummies",
        "storyPoints": 2,
        "acceptanceCriteria": "Ser capaz de criar e utilizar Promises para realizar tarefas assíncronas",
        "dueDate": "03/08/2023",
        "label": "backlog",
        "parentTask": "JS-1"
      },
      {
        "id":  JS-3,
        "title": "Aprender sobre Callbacks",
        "description": "Estudar callbacks, uma técnica fundamental para trabalhar com funções assíncronas em JavaScript. Recomenda-se o vídeo 'JavaScript Callbacks Explained!' disponível em: https://www.youtube.com/watch?v=QRq2zMHlBz4",
        "storyPoints": 1,
        "acceptanceCriteria": "Entender como utilizar callbacks para realizar operações assíncronas",
        "dueDate": "03/08/2023",
        "label": "backlog",
        "parentTask": "JS-1"

      }]`;

      return prompt;
    } else if ('owner' in text) {
      const prompt = `
    Como Product Owner de uma empresa renomada, sua experiência é fundamental para ajudar Roger a estruturar seu projeto baseado na metodologia SCRUM. Roger está iniciando o projeto "${text.projectName}" com duração prevista de ${text.duration} a partir de hoje. Ele se dedicará nos dias ${text.daysForWork}, enquanto ${text.people} pessoas participarão do projeto.

Com base na breve descrição de Roger sobre o projeto: "${text.description}", você pode detalhar as tarefas necessárias para que Roger alcance seus objetivos, lembre-se de detalhar o máximo possivel as tarefas. Essas tarefas serão transformadas em cards que serão utilizados na metodologia SCRUM, sendo todos eles iniciados no backlog.
Roger, gostaria de receber uma estrutura de saída similar a essas tasks:
    {
      "id": <Aqui você irá criar um acronimo de acordo com o titulo do board. exemplo: IN-1>
      "title": "Aprender sobre Callbacks",
      "description": "Estudar callbacks, uma técnica fundamental para trabalhar com funções assíncronas em JavaScript. Recomenda-se o vídeo 'JavaScript Callbacks Explained!' disponível em: https://www.youtube.com/watch?v=QRq2zMHlBz4",
      "storyPoints": 1,
      "acceptanceCriteria": "Entender como utilizar callbacks para realizar operações assíncronas",
      "dueDate": "03/08/2023",
      "label": "backlog"
    },
    {
      "id": <Aqui você irá criar um acronimo de acordo com o titulo do board. exemplo: IN-1>
      "title": "Aprender sobre Async/Await",
      "description": "Estudar a sintaxe e a utilização do recurso Async/Await do JavaScript permitindo escrever código assíncrono de forma síncrona. Para auxiliar, sugere-se ler a documentação oficial disponível em: https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/Asynchronous/Async_await",
      "storyPoints": 3,
      "acceptanceCriteria": "Ser capaz de utilizar o Async/Await para simplificar a escrita de código assíncrono",
      "dueDate": "03/08/2023",
      "label": "backlog"
    }
    
    A resposta que você irá retornar será em um bloco de  array que contém os cards gerados, lembre-se que array retornado deve estar na linguagem javascript, abaixo segue um exemplo de como essa reposta poderia, siga ela estrictamente retornando apenas o [cards gerados]: 
    [
      {
        "id":  JS-1
        "title": "Aprender sobre Promises",
        "description": "Estudar o conceito de Promises no JavaScript. Pode-se utilizar o artigo 'Understanding Promises in JavaScript' como referência: https://scotch.io/tutorials/javascript-promises-for-dummies",
        "storyPoints": 2,
        "acceptanceCriteria": "Ser capaz de criar e utilizar Promises para realizar tarefas assíncronas",
        "dueDate": "03/08/2023",
        "label": "backlog"
      },
      {
        "id":  JS-2
        "title": "Aprender sobre Callbacks",
        "description": "Estudar callbacks, uma técnica fundamental para trabalhar com funções assíncronas em JavaScript. Recomenda-se o vídeo 'JavaScript Callbacks Explained!' disponível em: https://www.youtube.com/watch?v=QRq2zMHlBz4",
        "storyPoints": 1,
        "acceptanceCriteria": "Entender como utilizar callbacks para realizar operações assíncronas",
        "dueDate": "03/08/2023",
        "label": "backlog"
      }]
    `;
      return prompt;
    }
  }
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async getBoardBasedOnQuestions(question: BoardQuestionInput) {
    try {
      const completion = await this.openAiApi.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: this.createPrompt(question) }],
      });

      const gptAnwser = completion.data.choices[0].message;

      const cardsArray = this.formatCompletion(gptAnwser);

      cardsArray.forEach((card) => (card.dueDate = new Date()));

      return cardsArray;
    } catch (error) {
      throw new Error(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async getSubTasksBasedOnTask(task: CreateTaskInput[], numberOfTasks: number) {
    try {
      const completion = await this.openAiApi.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: this.createPrompt(task[0], numberOfTasks) },
        ],
      });
      const gptAnwser = completion.data.choices[0].message;

      const subtasksArray = this.formatCompletion(gptAnwser);
      subtasksArray.forEach((subtask) => (subtask.dueDate = new Date()));
      return subtasksArray;
    } catch (error) {
      //   console.error(error);
      throw new Error(error);
    }
  }
}
