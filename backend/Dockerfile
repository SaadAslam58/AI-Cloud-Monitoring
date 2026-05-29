# Use a slim Python 3.11 base image
FROM python:3.11-slim

# Install uv package manager
RUN pip install uv

# Set the working directory
WORKDIR /app

# Copy the dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv sync (frozen ensures exact versions from lockfile)
# Note: we use system environment without creating a virtual environment inside docker
RUN uv sync --frozen

# Copy the rest of the application code
COPY . .

# Expose port 7860 (required by Hugging Face Spaces)
EXPOSE 7860

# Run the FastAPI server
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
