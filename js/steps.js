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
    let classValue = isValid ? "valid" : "invalid";
    this.CurrentElement.stepContainer.classList.remove("valid");
    this.CurrentElement.stepContainer.classList.remove("invalid");
    this.CurrentElement.stepContainer.classList.add(classValue);
    this.CurrentElement.isValid = isValid;
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
  decrementIncrementActiveStep(inReverseDirection) {
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
    this.decrementIncrementActiveStep(inReverseDirection);
    while (this.CurrentElement.type === "substep") {
      if ((this.validateInOrder && this.CurrentElement.valid == null) || isValid !== null) {
        this.validateStep(isValid);
      }
      this.decrementIncrementActiveStep(inReverseDirection);
    }
  }
  changeStep(inReverseDirection = false, skipSubsteps = true, isValid = null) {
    this.validateStep(isValid);
    if (this.isStepInRange(inReverseDirection)) {
      if (!skipSubsteps) {
        this.decrementIncrementActiveStep(inReverseDirection);
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
    let stepIndex = stepsFunction.childElements.indexOf(stepObject);
    stepsFunction.changeToGivenStep(stepIndex);
  }
  buildClickListener(stepObject) {
    stepObject.stepContainer.addEventListener("click", event => {
      this.stepClick(stepObject, this);
    });
  }
  createEachStepHTMLElements(stepData, parentElement = this.rootElement) {
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
    let restricted = !stepData.restricted ? false : true;
    let stepObject = {
      stepContainer: stepContainer,
      labelContainer: labelContainer,
      tooltipContainer: tooltipContainer,
      isValid: null,
      active: false,
      type: "step",
      restricted: restricted
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
      let substepObject = this.createEachStepHTMLElements(substep);
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
    let element = document.createElement(elementType);
    container.appendChild(element);
    return element;
  }
  get CurrentElement() {
    return this.childElements[this.activeStep];
  }
}
