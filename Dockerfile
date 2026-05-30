FROM nginx:alpine

# Copy the static HTML file to the default Nginx public directory
COPY src/. /usr/share/nginx/html/.

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]