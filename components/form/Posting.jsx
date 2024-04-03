"use client";

import { AddPhotoAlternateOutlined } from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const Posting = ({ post, apiEndpoint }) => {
  const [srcimage, setImage] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: post,
  });

  const router = useRouter();

  const uploadFileHandler = async (imgfile) => {
    let Url = null;
    const formData = new FormData();
    formData.append("file", imgfile);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );
    formData.append(
      "cloud_name",
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    );
    // console.log(
    //   process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    //   "process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
    // );
    // console.log(formData, "formData");
    try {
      // const res = await uploadProductImage(formData).unwrap();

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )
        .then((resp) => resp.json())
        .then((data) => {
          setImage(data.url);
          // console.log(data.url, "data.url");
        
          setValue("postPhoto", data.url);
          return data.url;
        })
        .catch((err) => console.log(err));

      // console.log(response, "res");
      return response;
      // toast.success("Image added successfully");
    } catch (error) {
      // toast.error(error?.data?.message || error.error);
      console.log(error, "error");
    }
  };

  const handlePublish = async (data) => {
    try {
      // console.log(data.postPhoto,"data postPhoto of form")
      const postForm = new FormData();

      postForm.append("creatorId", data.creatorId);
      postForm.append("caption", data.caption);
      postForm.append("tag", data.tag);

      if (typeof data.postPhoto !== "string") {
        const res = await uploadFileHandler(data.postPhoto[0]);
        console.log(res, "res uploadFileHandler1");
        postForm.append("postPhoto", res);
      } else {
        const res = await uploadFileHandler(data.postPhoto);
        console.log(res, "res uploadFileHandler2");
        postForm.append("postPhoto", res);
      }
      console.log(postForm,"postForm")
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: postForm,
      });

      if (response.ok) {
        router.push(`/profile/${data.creatorId}/posts`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form
      className="flex flex-col gap-7 pb-24"
      onSubmit={handleSubmit(handlePublish)}
    >
      <label
        htmlFor="photo"
        className="flex gap-4 items-center text-light-1 cursor-pointer"
      >
        {watch("postPhoto") ? (
          // Check profile photo is a string or a file
          typeof watch("postPhoto") === "string" ? (
            <Image
              src={watch("postPhoto")}
              alt="post"
              width={250}
              height={200}
              className="object-cover rounded-lg"
            />
          ) : (
            <Image
              src={URL.createObjectURL(watch("postPhoto")[0])}
              alt="post"
              width={250}
              height={200}
              className="object-cover rounded-lg"
            />
          )
        ) : (
          <AddPhotoAlternateOutlined
            sx={{ fontSize: "100px", color: "white" }}
          />
        )}
        <p>Upload a photo</p>
      </label>
      <input
        {...register("postPhoto", {
          validate: (value) => {
            if (
              typeof value === "null" ||
              (Array.isArray(value) && value.length === 0) ||
              value === "underfined"
            ) {
              return "A photo is required!";
            }
            return true;
          },
          onChange: (e) => {
            uploadFileHandler;
          },
        })}
        id="photo"
        type="file"
        style={{ display: "none" }}
      />
      {errors.postPhoto && (
        <p className="text-red-500">{errors.postPhoto.message}</p>
      )}

      <div>
        <label htmlFor="caption" className="text-light-1">
          Caption
        </label>
        <textarea
          {...register("caption", {
            required: "Caption is required",
            validate: (value) => {
              if (value.length < 3) {
                return "Caption must be more than 2 characters";
              }
            },
          })}
          type="text"
          rows={3}
          placeholder="What's on your mind?"
          className="w-full input"
          id="caption"
        />

        {errors.caption && (
          <p className="text-red-500">{errors.caption.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="tag" className="text-light-1">
          Tag
        </label>
        <input
          {...register("tag", { required: "Tag is required" })}
          type="text"
          placeholder="#tag"
          className="w-full input"
        />

        {errors.tag && <p className="text-red-500">{errors.tag.message}</p>}
      </div>

      <button
        type="submit"
        className="py-2.5 rounded-lg mt-10 bg-purple-1 hover:bg-pink-1 text-light-1"
      >
        Publish
      </button>
    </form>
  );
};

export default Posting;
