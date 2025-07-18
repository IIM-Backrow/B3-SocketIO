# Use nginx alpine image for serving static files
FROM nginx:alpine

# Copy frontend files to nginx html directory
COPY frontend/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]