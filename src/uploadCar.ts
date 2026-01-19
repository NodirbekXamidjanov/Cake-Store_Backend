export const deleteUploadcareFile = async (uuid: string) => {
    const res = await fetch(`https://api.uploadcare.com/files/${uuid}/`, {
        method: "DELETE",
        headers: {
          "Accept": "application/vnd.uploadcare-v0.7+json",
          "Authorization": "Basic " + Buffer.from(
            `${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`
          ).toString("base64")
        }
      });
    
      if (!res.ok) {
        throw new Error(`Uploadcare delete failed: ${res.status} ${res.statusText}`);
      }
  };
  