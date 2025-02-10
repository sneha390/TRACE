import Data from "./scrapper.module";

export const getResults = async (
  keyword: string | undefined,
  platform: string | undefined,
  start: string | undefined
): Promise<{ error?: string; results?: Object[] }> => {
  try {

    const startInt = parseInt(start ?? '', 10);
    if (!keyword || isNaN(startInt)) {
      return { error: 'Invalid or missing parameters' };
    }


    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);


    const results = await Data.find({
      keyword,
      platform,
      createdAt: { $gte: fortyEightHoursAgo },
    })
      .sort({ createdAt: -1 })
      .skip(startInt)
      .limit(10)
      .exec();

    return { results };
  } catch (error) {

    if (error instanceof Error) {
      console.error(`Error fetching results: ${error.message}`);
      return { error: error.message };
    }
    console.error('Unknown error occurred');
    return { error: 'Unknown error occurred' };
  }
};

export const storeResult = async (
  keyword: string,
  platform: string,
  results: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
  try {

    const newData = new Data({
      keyword,
      platform,
      results,
    });


    await newData.save();

    console.log(`Data successfully stored for keyword: ${keyword}, platform: ${platform}`);
    return { success: true, message: 'Data successfully stored' };
  } catch (error) {

    if (error instanceof Error) {
      console.error(`Error storing data: ${error.message}`);
      return { success: false, message: error.message };
    } else {
      console.error('Unknown error occurred');
      return { success: false, message: 'Unknown error occurred' };
    }
  }
};
