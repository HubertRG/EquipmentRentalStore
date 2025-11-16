# Select a base image
FROM  node:22-alpine

# Create a directory  and go to the directory 
WORKDIR /app

# Stwórz katalog uploads
RUN mkdir -p uploads

# Copy the package.json file to my current directory to install the necessary dependence  
COPY package.json .

# Install the dependence
RUN npm install

# Copy other files to my current directory
COPY . .


# Open the port for the express server
EXPOSE 3000

# Run express rum in the foreground
CMD ["npm", "start"]