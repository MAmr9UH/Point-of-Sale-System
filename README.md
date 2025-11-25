# Team 4: Foodtruck POS
## Members:
- Quang Hung Bui, Github username: hungqbui
- Arpitha Ashokan
- Diego Dominguez, Github username: DDominguez29
- Mohamed Amr
- Chuka Nwobu
## Submission References:
- Hosted webapp: https://possys.vercel.app/
- Project Document: https://docs.google.com/document/d/1UOP-uzjgax5Gt0HuEcGxOgvFvu0pxk0QiYBmBcNcKcg/edit?usp=sharing
## How to run (Node.js v22.14.0 & MySQL v8.0.43):
### 1. Client
- Go to the ```client``` folder using 
```bash
  cd ./client
```
- Install dependencies (React) and run
```bash
  npm i && npm run dev
```
- The app will be running at ```http://localhost:5173``` by default (if port is in use, check the command line for the current usable port). The vite proxy is set up for API server at port 3000 by default. Change if that's not available

```js
// ./client/vite.config.ts

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000' // change port here
    }
  }
})

```

### 2. Database
- The project uses [MySQL](https://www.mysql.com/). For development, the project runs on the local MySQL instance, after loading the schema at ```./server/db/db.sql```

- By default, the local credentials is:
```python
# ./server/.env
DB_URL=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=admin
DB_DATABASE=pos
```
which can be change (refer to the example .env)

- Use the Azure credentials submitted for the production database (or the populated dump file, located in ```./dbDump```) to view the complete database with triggers and mock data.

### 3. Server

- Go to the ```./server``` folder
```bash
cd ./server
```

- Optionally, create an ```.env``` file based on the ```.env.example```.

- Installs dependencies and run:
```bash
  npm i && npm run start
```

- The API is hosted by default at ```http://localhost:3000```

### 4. Hosting
- The repo includes a vercel workflow to host with your credentials ```vercel.json```
- Follow the instructions on [Vercel](https://vercel.com/) to install Vercel CLI.
- Run ```vercel``` in the command line and follow instruction and set up environment.
