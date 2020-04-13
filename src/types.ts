const types = {
  string: {
    template: (id): HTMLElement => {
      const el = document.createElement("input");
      el.setAttribute("name", id);
      el.setAttribute("type", "text");

      return el;
    },
    handler: () => "value"
  }
};

export default types;
