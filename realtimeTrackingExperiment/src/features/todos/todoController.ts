import { Request, Response } from "express";
import { ITodo } from "./todoModel";
import { getCollection } from "../../db/db";
import { ObjectId } from "mongodb";
import { getKey } from "../../utils/kms/controller";
import { base64ToByteArray } from "../../utils/encryption/utils";
import { decryptDeterministic, transformObject } from "../../utils/encryption/enc";

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing hospitalId"
      })
    }
    const todoColl = await getCollection<ITodo>(
      "TaskList",
      hospitalId?.toString()
    );
    const tasks: ITodo[] = await todoColl.find().skip(lowerLimit).limit(limit).toArray();
    if (tasks.length == 0) {
      res.status(404).json({
        success: true,
        message: "No task found.",
      });
    }
    else {
      //under development
      /*
      let decryptedTasks: ITodo[] = [];
      for (let task of tasks) {
        const k0 = await getKey(task.keyId);
        const key = base64ToByteArray(k0.key);
        const iv = base64ToByteArray(k0.IV);
        const decTask = await transformObject(
          task,
          decryptDeterministic,
          Buffer.from(key),
          Buffer.from(iv),
          ["_id", "keyId"],
          ["hospitalId"]
        )
        decryptedTasks.push(decTask);
      }*/
      return res.status(200).json({
        success: true,
        message: "Task fetched successfully.",
        //data: decryptedTasks,
      });
    }
  } catch (error: any) {
    console.error("Error in getting todo", error);
    res.status(500).json({
      success: false,
      message: "Error in fetching the task",
    });
  }
};

export const getTasksByCreaterId = async (req: Request, res: Response) => {
  try {
    const { hospitalId, creatorId } = req.query;
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }

    if (!hospitalId && !creatorId) {
      return res.status(400).json({
        success: true,
        message: "Required fields can't be empty"
      })
    }

    const todoColl = await getCollection<ITodo>("TaskList", hospitalId?.toString());

    const todos = await todoColl.find({ creatorId: creatorId }).skip(lowerLimit).limit(limit).toArray();

    if (todos.length == 0) {
      return res.status(404).json({
        success: true,
        message: "No task available"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      data: todos
    })


  } catch (error) {
    console.error("Error in getting todo", error);
    res.status(500).json({
      success: false,
      message: "Error in fetching the task",
    });
  }
}

export const getTasksByAssigneeId = async (req: Request, res: Response) => {
  try {
    const { hospitalId, assignedToId } = req.query;

    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }

    if (!hospitalId && !assignedToId) {
      return res.status(400).json({
        success: true,
        message: "Required fields can't be empty"
      })
    }

    const todoColl = await getCollection<ITodo>("TaskList", hospitalId?.toString());

    const todos = await todoColl.find({ assignedToId: assignedToId }).skip(lowerLimit).limit(limit).toArray();

    if (todos.length == 0) {
      return res.status(404).json({
        success: true,
        message: "No task available"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      data: todos
    })


  } catch (error) {
    console.error("Error in getting todo", error);
    res.status(500).json({
      success: false,
      message: "Error in fetching the task",
    });
  }
}

export const addTask = async (req: Request, res: Response) => {
  try {
    const { creatorId, title, description, assignedToId, status, hospitalId, priority } = req.body;
    if (!hospitalId || !creatorId || !title || !description || !assignedToId || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    const newTask: ITodo = {
      hospitalId: hospitalId?.toString(),
      creatorId: creatorId,
      assignedToId: assignedToId,
      title: title,
      description: description,
      status: status,
      priority: priority,
      keyId: undefined
    };
    const todoColl = await getCollection<ITodo>(
      "TaskList",
      hospitalId?.toString()
    );
    const task = await todoColl.insertOne(newTask);
    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: newTask,
    });
  }
  catch (error: any) {
    const errorMessage = error.message || "Unknown error occurred";
    console.error("Error in creating todo:", errorMessage);

    res.status(500).json({
      success: false,
      message: `Error creating task: ${errorMessage}`,
      code: error.code
    });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const updatedTask = req.body; // Assuming req.body contains the fields to update

    if (Object.keys(updatedTask).length == 0) {
      return res.status(400).json({
        success: true,
        message: "atleast one field is required to update",

      })
    }
    const todoColl = await getCollection<ITodo>(
      "TaskList",
      hospitalId?.toString()
    );
    const findTodo = await todoColl.findOne({ _id: mongoId });

    if (!findTodo) {
      return res.status(400).json({
        success: true,
        message: "task not found !"
      })
    }

    if (findTodo.status == "Completed") {
      return res.status(400).json({
        success: true,
        message: "Task already completetd"
      })
    }
    const task = await todoColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: updatedTask },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Task updated successfully.",
      task: task,
    });
  } catch (err) {
    console.error("Error in updating todo", err);
    res.status(500).json({
      success: false,
      message: "Error in updating a task",
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const todoColl = await getCollection<ITodo>(
      "TaskList",
      hospitalId?.toString()
    );
    const task = await todoColl.findOneAndDelete({ _id: mongoId });

    if (task) {
      return res.status(201).json({
        success: true,
        message: "Task deleted successfully.",
        data: task,
      });
    } else {
      return res.status(404).json({
        success: true,
        message: "Task not found",
      });
    }
  } catch (error) {
    console.error("Error in deleting todo", error);
    res.status(500).json({
      success: false,
      message: "Error in deleting a task",
    });
  }
};
