# Thumbnail generator

## Description

Generate multiple watermarked thumbnails of various sizes from images, using worker thread.  
Using Express as backend framework, formidable as file parser, jimp is being used to edit images, mongoose to connect to mongodb.  
One challenge that I faced when working on this project is to develop queue system without using any additional library, where all task are inserted as soon as the request is received. A task is taken out of the queue and assigned to multiple threads depending on thumbnail dimensions. Each thread is responsible to generate a single thumbnail. After one task is done all threads are exited then next task is poped out and assinged, process continues until queue is empty.
For future enhancement we can make this queue to be fault tolerence i.e., if our server crashed all the task in queue will not be lost and our generator can work on previously assigned task.

## Prerequisites

```
Node v10.5+
```

## Install

```
npm i
```

## How to use

- Add mongo connection string along with db name in the .env.
- start server `npm run dev`
- send **POST** request to `localhost:3000/upload` with image as payload.
- You'll get an array of ids for upload image.
- for fetching details of uploaded image like file path, thumbnail path etc make **GET** request to `localhost:3000/upload/{id}`
