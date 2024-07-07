from bs4 import BeautifulSoup

# Load the HTML file
with open('../../assets/map_svg.html', 'r', encoding='utf-8') as file:
    html_content = file.read()

# Parse the HTML content
soup = BeautifulSoup(html_content, 'html.parser')

# Find all path elements
paths = soup.find_all('path')

# Extract the id and d attribute
location_data = []
for path in paths:
    country_name = path.get('id')
    path_data = path.get('d')
    if country_name and path_data:
        location_data.append({
            'name': country_name,
            'path_data': path_data
        })

# Save the extracted data to a JSON file
import json
with open('locations.json', 'w', encoding='utf-8') as json_file:
    json.dump(location_data, json_file, ensure_ascii=False, indent=4)
