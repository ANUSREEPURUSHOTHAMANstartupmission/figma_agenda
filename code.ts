// Sample code structure
figma.showUI(__html__, { width: 300, height: 200 });

// Event listener for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'getData') {
    await fetchDataFromAPI(msg.url);
  }
};

// Type definition for the expected structure of the API response
interface AgendaData {
  [date: string]: {
    [venue: string]: {
      name: string;
      category: string;
      speakers?: {
        speaker: {
          name: string;
          designation: string;
          organisation: string;
          linkedin: string;
        }[];
      };
    }[];
  };
}

// Function to fetch data from the API
async function fetchDataFromAPI(apiUrl: string) {
  try {
    const response = await fetch(apiUrl);
    const data: AgendaData = await response.json();

    if (isValidAgendaData(data)) {
      const selection = figma.currentPage.selection;

      if (selection.length > 0) {
        const frame = selection[0] as FrameNode;
        const formattedData = formatEventData(data);
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

        const textNode = figma.createText();
        textNode.characters = formattedData;

        frame.appendChild(textNode);
        figma.closePlugin();
      } else {
        console.error('Please select a frame in Figma before running the plugin.');
      }
    } else {
      console.error('API response does not contain valid data:', data);
    }
  } catch (error) {
    console.error('Error fetching data from the API:', error);
  }
}

// Function to check if the agenda data has a valid structure
function isValidAgendaData(data: any): data is AgendaData {
  return typeof data === 'object' && data !== null;
}

// Function to format event data for display
function formatEventData(agendaData: AgendaData): string {
  let formattedString = '';

  for (const date in agendaData) {
    formattedString += `Date: ${date}\n`;

    for (const venue in agendaData[date]) {
      formattedString += `Venue: ${venue}\n`;

      const events = agendaData[date][venue];

      for (const event of events) {
        formattedString += `Event Name: ${event.name}\n`;
        formattedString += `Category: ${event.category}\n`;

        if (event.speakers) {
          for (const speaker of event.speakers.speaker || []) {
            formattedString += `Speaker Name: ${speaker.name}\n`;
            formattedString += `  Designation: ${speaker.designation}\n`;
            formattedString += `  Organisation: ${speaker.organisation}\n`;
            formattedString += `  LinkedIn: ${speaker.linkedin}\n\n`;
          }
        }

        formattedString += '\n';
      }
    }
  }

  return formattedString;
}

// Example usage
const apiUrl = 'https://events.startupmission.in/api/event/huddle-global-2023/agenda/venue';
fetchDataFromAPI(apiUrl);
