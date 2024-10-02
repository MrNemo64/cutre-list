# CutreList

CutreList is a project I developed during my degree, consisting of an Express server and a Vue.js client. The goal was to deepen my understanding of OpenAPI, REST APIs, and building SPAs.

The core functionality of the project is a simple CRUD TODO app. You can find a detailed description of the features in the [OLD_README.md](https://github.com/MrNemo64/cutre-list/blob/main/OLD_README.md). While most of the functionality revolves around standard CRUD operations with pagination, there is one feature I’m particularly proud of.

One of my goals was to allow the same user to maintain multiple active sessions simultaneously. For example, if a user had two browser tabs open on the tasks view and edited a task in one tab, the changes would automatically reflect in the other tab. To achieve this, I implemented Server-Sent Events, which I learned and integrated on my own.

While SSE may seem unnecessary for a simple TODO app, this implementation paves the way for more advanced features, such as task sharing between users, with all participants seeing updates in real-time.

You can find further details about this feature, along with GIFs showing how it works, at the end of the [OLD_README.md](https://github.com/MrNemo64/cutre-list/blob/main/OLD_README.md#SSE).

## Deploying

There is a docker compose provided that exposes the API to the localhost on port 3000 and the Vue.js client on port 5173.
