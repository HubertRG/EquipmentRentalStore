FROM  node:22-alpine

# Create a directory  and go to the directory 
WORKDIR /app

# Copy the package.json file to my current directory to install the necessary dependence  
COPY package.json .

# Install the dependence
RUN npm install

# Copy other files to my current directory
COPY . .

# Open the port to react
EXPOSE 5173

# Run frontend app
CMD ["npm", "run", "dev"]