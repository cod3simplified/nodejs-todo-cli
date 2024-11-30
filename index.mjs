import fs from "fs";
import { Command } from "commander";
import { nanoid } from "nanoid";
import chalk from "chalk";
import Table from "cli-table3";

const validStatuses = {
  todo: true,
  "in-progress": true,
  done: true,
};

function loadTodos() {
  let data = fs.readFileSync("./data/data.json", "utf-8");

  if (!data) {
    data = [];
  } else {
    data = JSON.parse(data);
  }
  return data;
}

const program = new Command();

program
  .name("TodoList")
  .description("CLI-Based todo list app")
  .version("1.0.0");

program
  .command("add")
  .description("Adds a new todo to the list of todos")
  .requiredOption("-t, --title <value>", "Task title")
  .requiredOption("-s | --status <value>", "Task status.")
  .action((options) => {
    const title = options.title;
    const status = options.status;
    if (!(status in validStatuses)) {
      console.log(
        chalk.red("Status can either be 'todo' or 'in-progress' or 'done'"),
      );
      return;
    }

    const todo = { id: nanoid(3), title, status };

    const data = loadTodos();
    data.push(todo);
    fs.writeFile("./data/data.json", JSON.stringify(data), (err) => {
      if (err) {
        console.log(chalk.red(`Server error`));
      } else {
        console.log(chalk.green(`Todo added successfully`));
      }
    });
  });

program
  .command("read")
  .description("Display todos or display a specified todo")
  .option("-i | --id <value>", "Todo id")
  .action((options) => {
    const id = options.id;
    const data = loadTodos();
    const table = new Table({
      head: ["id", "title", "status"],
      colWidths: [5, 30, 20],
      wordWrap: true,
    });

    if (id) {
      const todo = data.find((item) => item.id === id);
      if (todo) {
        table.push([todo.id, todo.title, todo.status]);
      } else {
        console.log(chalk.red("Todo not found"));
        return;
      }
    } else {
      data.forEach((item) => {
        table.push([item.id, item.title, item.status]);
      });
    }
    console.log(table.toString());
  });

program
  .command("update")
  .description("Update a specific todo")
  .requiredOption("-i | --id <value>", "Task id")
  .option("-t | --title <value>", "New title")
  .option("-s | --status <value>", "New status")
  .action((options) => {
    const id = options.id;
    const title = options.title;
    const status = options.status;
    if (status && !(status in validStatuses)) {
      console.log(
        chalk.red(`Status can either be 'todo' or 'in-progress' or 'done'`),
      );
      return;
    }

    const todos = loadTodos();

    const updatedTodos = todos.map((item) => {
      if (item.id === id) {
        if (title) {
          item.title = title;
        }
        if (status) {
          item.status = status;
        }
      }
      return item;
    });

    fs.writeFile("./data/data.json", JSON.stringify(updatedTodos), (err) => {
      if (err) {
        console.log(chalk.red(`Server error`));
      } else {
        console.log(chalk.green(`Update successful`));
      }
    });
  });

program
  .command("delete")
  .description("Delete a todo")
  .requiredOption("-i | --id <value>", "Todo id")
  .action((options) => {
    const id = options.id;

    const todos = loadTodos();

    const remainingTodos = todos.filter((item) => item.id !== id);

    fs.writeFile("./data/data.json", JSON.stringify(remainingTodos), (err) => {
      if (err) {
        console.log(chalk.red(`Server error`));
      } else {
        console.log(chalk.green(`Todo deleted successfully`));
      }
    });
  });

program
  .command("filter")
  .description("Filter todos by status")
  .requiredOption("-s | --status <value>", "Status")
  .action((options) => {
    const status = options.status;
    if (!(status in validStatuses)) {
      console.log(chalk.red(`Invalid status`));
      return;
    }
    const table = new Table({
      head: ["id", "title", "status"],
      colWidths: [5, 30, 20],
      wordWrap: true,
    });

    const todos = loadTodos();

    todos.forEach((item) => {
      if (item.status === status) {
        table.push([item.id, item.title, item.status]);
      }
    });

    console.log(table.toString());
  });

program.parse();
