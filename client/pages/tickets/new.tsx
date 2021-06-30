import Router from "next/router";
import React, { useState } from "react";
import useRequest from "../../hooks/use-request";

const NewTicket = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title,
      price,
    },
  });

  const onBlur = () => {
    const value = parseFloat(price);

    if (Number.isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await doRequest();

    if (response.isSuccessfull) {
      Router.push("/");
    }
  };

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlur}
            onChange={(event) => setPrice(event.target.value)}
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default NewTicket;
