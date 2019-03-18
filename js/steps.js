class Steps {
  constructor({ selector = null, steps = null, defaultValidator = false, validateInOrder = true, navigateOnClick = !validateInOrder } = {}) {
    this.rootElement = document.querySelector(selector);
    this.steps = steps;
    this.childElements = [];
    this.navigateOnClick = navigateOnClick;
    this.validateInOrder = validateInOrder;
    this.defaultValidator = defaultValidator;
    this.createAllHTMLElements();
    this.changeActiveStep(0);
  }
  changeActiveStep(stepIndex) {
    this.activeStep = stepIndex;
    this.childElements.map(childElement => childElement.stepContainer.classList.remove("active"));
    this.childElements[stepIndex].stepContainer.classList.add("active");
    this.changeProgressBarWidth(this.childElements[stepIndex].stepContainer);
  }
  completeStep(isValid) {
    const classValue = isValid ? "valid" : "invalid";
    this.currentElement.stepContainer.classList.remove("valid", "invalid");
    this.currentElement.stepContainer.classList.add(classValue);
    this.currentElement.isValid = isValid;
  }
  validateStep(isValid) {
    if (isValid != null || this.validateInOrder) {
      isValid = isValid === null ? this.defaultValidator : isValid;
      this.completeStep(isValid);
    }
  }
  isStepInRange(inReverseDirection) {
    return inReverseDirection ? this.activeStep > 0 : this.activeStep < this.childElements.length - 1;
  }
  decrementOrIncrementActiveStep(inReverseDirection) {
    this.activeStep += inReverseDirection ? -1 : 1;
  }
  validateUntilPoint(point, isValid = this.defaultValidator) {
    this.activeStep = 0;
    while (this.activeStep < point) {
      this.validateStep(isValid);
      this.activeStep++;
    }
  }
  moveToNextStep(inReverseDirection, isValid) {
    this.decrementOrIncrementActiveStep(inReverseDirection);
    while (this.currentElement.type === "substep") {
      if ((this.validateInOrder && this.currentElement.valid == null) || isValid !== null) {
        this.validateStep(isValid);
      }
      this.decrementOrIncrementActiveStep(inReverseDirection);
    }
  }
  changeStep({ inReverseDirection = false, skipSubsteps = true, isValid = null } = {}) {
    this.validateStep(isValid);
    if (this.isStepInRange(inReverseDirection)) {
      if (!skipSubsteps) {
        this.decrementOrIncrementActiveStep(inReverseDirection);
      } else {
        this.moveToNextStep(inReverseDirection, isValid);
      }
    }
    this.changeActiveStep(this.activeStep);
  }
  changeToGivenStep(newStep) {
    this.activeStep = newStep;
    if (this.validateInOrder) {
      this.validateUntilPoint(newStep);
    }
    this.changeActiveStep(this.activeStep);
  }
  changeProgressBarWidth(stepContainer) {
    this.progressBarContainerDesktop.style.width = `${stepContainer.offsetLeft}px`;
    this.progressBarContainerMobile.style.height = `${stepContainer.offsetTop}px`;
  }
  stepClick(stepObject, stepsFunction) {
    const stepIndex = stepsFunction.childElements.indexOf(stepObject);
    stepsFunction.changeToGivenStep(stepIndex);
  }
  buildClickListener(stepObject) {
    stepObject.stepContainer.addEventListener("click", event => {
      this.stepClick(stepObject, this);
    });
  }
  createEachStepHTMLElements(stepData, parentElement = this.rootElement) {
    const stepContainer = this.createElementInContainer("div", parentElement);
    stepContainer.classList.add("step");
    const labelContainer = this.createElementInContainer("div", stepContainer);
    labelContainer.classList.add("label");
    labelContainer.innerHTML = stepData.label;
    let tooltipContainer = null;
    if (stepData.tooltip) {
      tooltipContainer = this.createElementInContainer("div", stepContainer);
      tooltipContainer.classList.add("tooltip");
      tooltipContainer.innerHTML = stepData.tooltip;
    }
    const restricted = stepData.restricted === null ? false : stepData.restricted;
    const stepObject = {
      stepContainer,
      labelContainer,
      tooltipContainer,
      restricted,
      isValid: null,
      active: false,
      type: "step"
    };
    this.childElements.push(stepObject);
    if (stepData.steps) {
      this.createSubstepElements(stepData.steps);
    }
    if (this.navigateOnClick) {
      this.buildClickListener(stepObject);
    }
    return stepObject;
  }
  createSubstepElements(substeps) {
    for (let substep of substeps) {
      const substepObject = this.createEachStepHTMLElements(substep);
      substepObject.stepContainer.classList.replace("step", "substep");
      substepObject.type = "substep";
    }
  }
  createProgressBarContainers() {
    this.progressBarContainerDesktop = this.createElementInContainer("div");
    this.progressBarContainerMobile = this.createElementInContainer("div");
    this.progressBarContainerDesktop.classList.add("completed-progress");
    this.progressBarContainerMobile.classList.add("completed-progress-mobile");
  }
  createAllHTMLElements() {
    this.rootElement.classList.add("steps-root");
    this.createProgressBarContainers();
    for (let stepData of this.steps) {
      this.createEachStepHTMLElements(stepData);
    }
  }
  createElementInContainer(elementType, container = this.rootElement) {
    const element = document.createElement(elementType);
    container.appendChild(element);
    return element;
  }
  get currentElement() {
    return this.childElements[this.activeStep];
  }
}
