import mondaySdk from 'monday-sdk-js';

const monday = mondaySdk();

const fetchItemData = async (itemId) => {
  try {
    const response = await monday.api(`query{items(ids: ${itemId}){ column_values{ column{ id title type settings_str} id text value type }}}`,{apiVersion: '2023-10'});
    const itemData = response.data.items[0];
    console.log(response);
    return itemData;
  } catch (error) {
    console.error('Error fetching item data:', error);
    throw error;
  }
};

export { fetchItemData };
