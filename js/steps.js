class Steps {
  constructor({ selector = null, steps = null, validateInOrder = true, navigateOnClick = !validateInOrder } = {}) {
    this.rootElement = document.querySelector(selector);
    this.steps = steps;
    this.childElements = [];
    this.navigateOnClick = navigateOnClick;
    this.validateInOrder = validateInOrder;
    this.createAllHTMLElements();
    this.changeActiveStep(0);
  }
  changeActiveStep(stepIndex) {
    console.log("New index is", stepIndex);
    this.activeStep = stepIndex;
    this.childElements.map(childElement => childElement.stepContainer.classList.remove("active"));
    this.childElements[stepIndex].stepContainer.classList.remove("valid");
    this.childElements[stepIndex].stepContainer.classList.remove("invalid");
    this.childElements[stepIndex].stepContainer.classList.add("active");
    this.changeCompletedProgressWidth(this.childElements[stepIndex].stepContainer);
  }
  completeStep(isValid) {
    let classValue = isValid ? "valid" : "invalid";
    this.childElements[this.activeStep].stepContainer.classList.remove("valid");
    this.childElements[this.activeStep].stepContainer.classList.remove("invalid");
    console.log(classValue);
    this.childElements[this.activeStep].stepContainer.classList.add(classValue);
  }
  nextStep(skipSubsets = true, isValid) {
    if (isValid != null || this.validateInOrder) {
      this.completeStep(isValid);
    }
    if (this.activeStep + 1 < this.childElements.length) {
      this.changeActiveStep(this.activeStep + 1);
    }
  }
  prevStep(skipSubsets = true, isValid) {
    if (isValid !== null) {
      this.completeStep(isValid);
    }
    if (this.activeStep > 0) {
      this.changeActiveStep(this.activeStep - 1);
    }
  }
  changeCompletedProgressWidth(stepContainer) {
    this.completedProgressDesktopContainer.style.width = `${stepContainer.offsetLeft}px`;
    this.completedProgressMobileContainer.style.height = `${stepContainer.offsetTop}px`;
  }
  createEachStepElements(stepData, parentElement = this.rootElement) {
    let stepContainer = this.createElementInContainer("div", parentElement);
    stepContainer.classList.add("step");
    let labelContainer = this.createElementInContainer("div", stepContainer);
    labelContainer.classList.add("label");
    labelContainer.innerHTML = stepData.label;
    let tooltipContainer = null;
    if (stepData.tooltip) {
      tooltipContainer = this.createElementInContainer("div", stepContainer);
      tooltipContainer.classList.add("tooltip");
      tooltipContainer.innerHTML = stepData.tooltip;
    }
    let stepObject = {
      stepContainer: stepContainer,
      labelContainer: labelContainer,
      tooltipContainer: tooltipContainer
    };
    this.childElements.push(stepObject);
    if (stepData.steps) {
      this.createSubstepElements(stepData.steps);
    }
    return stepObject;
  }
  createSubstepElements(substeps) {
    for (let substep of substeps) {
      let substepObject = this.createEachStepElements(substep);
      substepObject.stepContainer.classList.replace("step", "substep");
    }
  }
  createCompletedProgressContainers() {
    this.completedProgressDesktopContainer = this.createElementInContainer("div");
    this.completedProgressMobileContainer = this.createElementInContainer("div");
    this.completedProgressDesktopContainer.classList.add("completed-progress");
    this.completedProgressMobileContainer.classList.add("completed-progress-mobile");
  }
  createAllHTMLElements() {
    this.rootElement.classList.add("steps-root");
    this.createCompletedProgressContainers();
    for (let stepData of this.steps) {
      this.createEachStepElements(stepData);
    }
  }
  createElementInContainer(elementType, container = this.rootElement) {
    let element = document.createElement(elementType);
    container.appendChild(element);
    return element;
  }
}
