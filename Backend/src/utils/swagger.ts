// Copyrights Code: https://github.com/TomDoesTech/REST-API-Tutorial-Updated/blob/main/src/utils/swagger.ts

import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Explore and Connect REST API Docs",
      version,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        IAddress: {
          type: "object",
          properties: {
            postalCode: {
              type: "string",
            },
            city: {
              type: "string",
            },
          },
        },
        IEAddress: {
          type: "object",
          properties: {
            street: {
              type: "string",
            },
            houseNumber: {
              type: "string",
            },
            apartmentNumber: {
              type: "string",
            },
            postalCode: {
              type: "string",
            },
            city: {
              type: "string",
            },
            stateOrRegion: {
              type: "string",
            },
            country: {
              type: "string",
            },
          },
        },
        ICategory: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            description: {
              type: "string",
            },
          },
        },
        IChat: {
          type: "object",
          properties: {
            // Define IChat properties
          },
        },
        IUser: {
          type: "object",
          properties: {
            email: {
              type: "string",
            },
            name: {
              type: "object",
              properties: {
                first: {
                  type: "string",
                },
                last: {
                  type: "string",
                },
              },
            },
            password: {
              type: "string",
            },
            isAdministrator: {
              type: "boolean",
            },
            address: {
              $ref: "#/components/schemas/IAddress",
            },
            profilePicture: {
              type: "string",
            },
            birthDate: {
              type: "date",
              format: "date",
            },
            gender: {
              type: "string",
            },
            socialMediaUrls: {
              type: "object",
              properties: {
                facebook: {
                  type: "string",
                },
                instagram: {
                  type: "string",
                },
              },
            },
            isActive: {
              type: "boolean",
            },
          },
        },
        IEvent: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            creator: {
              $ref: "#/components/schemas/IUser", // Reference to IUser schema
            },
            description: {
              type: "string",
            },
            price: {
              type: "number",
              minimum: 0,
            },
            date: {
              type: "string", // Date represented as string in ISO 8601 format
              format: "date-time",
            },
            address: {
              $ref: "#/components/schemas/IEAddress",
            },
            thumbnail: {
              type: "string",
            },
            hashtags: {
              type: "array",
              items: {
                type: "string",
              },
            },
            category: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ICategory",
              },
            },
            chat: {
              $ref: "#/components/schemas/IChat", // Reference to IChat schema
            },
            participants: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
        IComment: {
          type: "object",
          properties: {
            title: {
              type: "string",
            },
            stars: {
              type: "number",
              minimum: 1,
              maximum: 5,
            },
            content: {
              type: "string",
            },
            edited: {
              type: "boolean",
            },
            creator: {
              $ref: "#/components/schemas/IUser",
            },
            event: {
              $ref: "#/components/schemas/IEvent",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/model/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number) {
  // Swagger page
  app.use("/swagger/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get("/docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`Docs available at https://localhost:${port}/swagger/docs`);
}

export default swaggerDocs;
