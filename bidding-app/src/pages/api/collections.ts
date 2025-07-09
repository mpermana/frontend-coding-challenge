import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";

const jsonFilePath = path.join(process.cwd(), "data", "collections.json");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Read JSON file every request
  const jsonData = await fs.readFile(jsonFilePath, "utf-8");
  let collections = JSON.parse(jsonData);

  const { method, body, query } = req;

  switch (method) {
    case "GET":
      res.status(200).json(collections);
      break;

    case "POST":
      const newCollection = { id: Date.now(), ...body };
      collections.push(newCollection);
      await fs.writeFile(jsonFilePath, JSON.stringify(collections, null, 2));
      res.status(201).json(newCollection);
      break;

    case "PUT":
      const idToUpdate = Number(query.id);
      const idxToUpdate = collections.findIndex((c) => c.id === idToUpdate);

      if (idxToUpdate === -1) {
        res.status(404).json({ message: "Collection not found" });
        return;
      }

      collections[idxToUpdate] = { ...collections[idxToUpdate], ...body };
      await fs.writeFile(jsonFilePath, JSON.stringify(collections, null, 2));
      res.status(200).json(collections[idxToUpdate]);
      break;

    case "DELETE":
      const idToDelete = Number(query.id);
      const idxToDelete = collections.findIndex((c) => c.id === idToDelete);

      if (idxToDelete === -1) {
        res.status(404).json({ message: "Collection not found" });
        return;
      }

      collections.splice(idxToDelete, 1);
      await fs.writeFile(jsonFilePath, JSON.stringify(collections, null, 2));
      res.status(200).json({ message: `Collection ${idToDelete} deleted` });
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
